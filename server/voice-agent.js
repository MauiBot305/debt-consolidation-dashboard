/**
 * Voice Agent Server — "Maui"
 * Real-time conversational AI phone agent using:
 *   Twilio Media Streams ↔ WebSocket ↔ Deepgram STT → Claude LLM → ElevenLabs TTS
 *
 * Endpoints:
 *   POST /twiml/inbound     — TwiML for inbound calls (connects media stream)
 *   POST /twiml/outbound    — TwiML for outbound calls
 *   WS   /media-stream      — Twilio Media Stream WebSocket
 *   POST /api/call           — Initiate outbound call from dashboard
 *   GET  /api/active-calls   — List active AI agent calls
 *   GET  /api/call/:sid/transcript — Get live transcript
 *   POST /api/call/:sid/takeover  — Human takes over from Maui
 *   GET  /health             — Health check
 */

import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCors from '@fastify/cors';
import fastifyFormbody from '@fastify/formbody';
import twilio from 'twilio';

import { config } from './config.js';
import { DeepgramSTT } from './stt-deepgram.js';
import { ElevenLabsTTS } from './tts-elevenlabs.js';
import { LLMHandler } from './llm-handler.js';
import { CallMemory } from './call-memory.js';
import { detectLanguage, languageName } from './language-detect.js';

const app = Fastify({ logger: true });
await app.register(fastifyWebsocket);
await app.register(fastifyCors, { origin: true });
await app.register(fastifyFormbody);

const twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
const callMemory = new CallMemory();

// Track active sessions by callSid → { stt, tts, llm, streamSid, ws }
const sessions = new Map();

// ─── TwiML Endpoints ──────────────────────────────────────────────────────────

app.post('/twiml/inbound', async (req, reply) => {
  const from = req.body?.From || 'unknown';
  console.log(`[Inbound] Call from ${from}`);

  // Check if we know this caller
  const history = await callMemory.getCallerHistory(from);
  const greeting = history?.name
    ? `Welcome back, ${history.name}. How can I help you today?`
    : `Hey, this is Maui. How can I help you today?`;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew">${greeting}</Say>
  <Connect>
    <Stream url="wss://${new URL(config.publicUrl).host}/media-stream">
      <Parameter name="direction" value="inbound" />
      <Parameter name="callerNumber" value="${from}" />
      ${history?.name ? `<Parameter name="callerName" value="${history.name}" />` : ''}
    </Stream>
  </Connect>
</Response>`;

  reply.type('text/xml').send(twiml);
});

app.post('/twiml/outbound', async (req, reply) => {
  const leadName = req.body?.leadName || req.query?.leadName || '';
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://${new URL(config.publicUrl).host}/media-stream">
      <Parameter name="direction" value="outbound" />
      <Parameter name="leadName" value="${leadName}" />
    </Stream>
  </Connect>
</Response>`;

  reply.type('text/xml').send(twiml);
});

// ─── Media Stream WebSocket ───────────────────────────────────────────────────

app.register(async function (fastify) {
  fastify.get('/media-stream', { websocket: true }, (socket, req) => {
    console.log('[MediaStream] WebSocket connected');

    let callSid = null;
    let streamSid = null;
    let session = null;

    socket.on('message', async (rawMsg) => {
      try {
        const msg = JSON.parse(rawMsg);

        switch (msg.event) {
          case 'connected':
            console.log('[MediaStream] Connected event');
            break;

          case 'start': {
            streamSid = msg.start.streamSid;
            callSid = msg.start.callSid;
            const params = msg.start.customParameters || {};

            console.log(`[MediaStream] Stream started — call=${callSid} stream=${streamSid}`);

            // Initialize session components
            const stt = new DeepgramSTT();
            const tts = new ElevenLabsTTS();
            const llm = new LLMHandler();

            session = { stt, tts, llm, streamSid, callSid, ws: socket, interrupted: false };
            sessions.set(callSid, session);

            // Start call memory tracking
            callMemory.startCall(callSid, {
              from: params.callerNumber || '',
              to: config.twilio.phoneNumber,
              direction: params.direction || 'inbound',
              leadName: params.callerName || params.leadName || null,
            });

            // Set outbound context if needed
            if (params.direction === 'outbound' && params.leadName) {
              llm.setOutboundContext(params.leadName);
              // Generate and speak the opening line
              const opening = await llm.respond('[Start the outbound call now]');
              callMemory.addTranscript(callSid, 'maui', opening);
              await speakToTwilio(session, opening);
            }

            // Connect STT
            stt.connect();

            // Wire up STT events
            stt.on('transcript', (result) => {
              handleTranscript(session, callSid, result);
            });

            stt.on('utteranceEnd', () => {
              handleUtteranceEnd(session, callSid);
            });

            // Wire up TTS → Twilio audio
            tts.on('audio', (base64Audio) => {
              if (socket.readyState === 1) { // WebSocket.OPEN
                socket.send(JSON.stringify({
                  event: 'media',
                  streamSid,
                  media: { payload: base64Audio },
                }));
              }
            });

            break;
          }

          case 'media': {
            // Forward audio to Deepgram STT
            if (session?.stt) {
              const audioBuffer = Buffer.from(msg.media.payload, 'base64');
              session.stt.sendAudio(audioBuffer);
            }
            break;
          }

          case 'stop': {
            console.log(`[MediaStream] Stream stopped — call=${callSid}`);
            await cleanupSession(callSid);
            break;
          }
        }
      } catch (err) {
        console.error('[MediaStream] Error:', err);
      }
    });

    socket.on('close', async () => {
      console.log(`[MediaStream] WebSocket closed — call=${callSid}`);
      await cleanupSession(callSid);
    });
  });
});

// ─── Transcript + Barge-in Logic ──────────────────────────────────────────────

// Buffer for accumulating speech before sending to LLM
const utteranceBuffers = new Map(); // callSid → { text, timeout, interimCount }

function handleTranscript(session, callSid, result) {
  const { text, isFinal, language, speechFinal } = result;

  // Barge-in: if caller speaks while Maui is talking, interrupt
  if (session.tts.isSpeaking && !isFinal) {
    // Count interim words — if enough, interrupt TTS
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= config.bargeIn.interimThreshold) {
      console.log(`[Barge-in] Caller interrupted Maui: "${text}"`);
      session.tts.interrupt();
      // Send clear message to Twilio to stop any buffered audio
      if (session.ws.readyState === 1) {
        session.ws.send(JSON.stringify({ event: 'clear', streamSid: session.streamSid }));
      }
    }
    return;
  }

  // Accumulate the utterance
  let buf = utteranceBuffers.get(callSid);
  if (!buf) {
    buf = { text: '', timeout: null, interimCount: 0 };
    utteranceBuffers.set(callSid, buf);
  }

  if (isFinal) {
    buf.text += (buf.text ? ' ' : '') + text;
    buf.interimCount = 0;

    // Detect language from content
    const detectedLang = detectLanguage(text) || language;
    if (detectedLang && detectedLang !== 'en') {
      session.stt.setLanguage(detectedLang);
      callMemory.addTranscript(callSid, 'system', `Language detected: ${languageName(detectedLang)}`);
    }

    // If Deepgram says speech is final, process immediately
    if (speechFinal) {
      processUtterance(session, callSid, buf.text.trim(), detectedLang);
      utteranceBuffers.delete(callSid);
      return;
    }

    // Otherwise set a short timeout to wait for more speech
    clearTimeout(buf.timeout);
    buf.timeout = setTimeout(() => {
      const finalText = buf.text.trim();
      utteranceBuffers.delete(callSid);
      if (finalText) {
        processUtterance(session, callSid, finalText, detectedLang);
      }
    }, config.bargeIn.silenceMs);

  } else {
    buf.interimCount++;
  }
}

function handleUtteranceEnd(session, callSid) {
  const buf = utteranceBuffers.get(callSid);
  if (buf?.text?.trim()) {
    clearTimeout(buf.timeout);
    const finalText = buf.text.trim();
    utteranceBuffers.delete(callSid);
    processUtterance(session, callSid, finalText);
  }
}

async function processUtterance(session, callSid, text, language) {
  console.log(`[Caller] "${text}" (${language || 'en'})`);
  callMemory.addTranscript(callSid, 'caller', text, language);

  try {
    // Get LLM response
    const response = await session.llm.respond(text, { language });
    console.log(`[Maui] "${response}"`);
    callMemory.addTranscript(callSid, 'maui', response);

    // Speak it
    await speakToTwilio(session, response);

  } catch (err) {
    console.error('[Process] LLM/TTS error:', err.message);
    // Fallback: simple acknowledgment
    await speakToTwilio(session, "I'm sorry, I had a hiccup. Could you repeat that?");
  }
}

async function speakToTwilio(session, text) {
  if (!session || session.ws.readyState !== 1) return;
  await session.tts.speak(text);
}

// ─── Session Cleanup ──────────────────────────────────────────────────────────

async function cleanupSession(callSid) {
  if (!callSid) return;
  const session = sessions.get(callSid);
  if (!session) return;

  session.stt.close();
  session.tts.interrupt();

  const summary = session.llm.getSummary();
  await callMemory.endCall(callSid, summary);

  utteranceBuffers.delete(callSid);
  sessions.delete(callSid);
  console.log(`[Session] Cleaned up call ${callSid}`);
}

// ─── Dashboard API Endpoints ──────────────────────────────────────────────────

// Initiate outbound AI agent call
app.post('/api/call', async (req, reply) => {
  const { to, leadName, leadInfo } = req.body || {};
  if (!to) return reply.code(400).send({ error: 'Missing "to" phone number' });

  try {
    const call = await twilioClient.calls.create({
      to,
      from: config.twilio.phoneNumber,
      url: `${config.publicUrl}/twiml/outbound?leadName=${encodeURIComponent(leadName || '')}`,
      statusCallback: `${config.publicUrl}/api/call-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    });

    console.log(`[Outbound] Calling ${to} (lead: ${leadName}) — sid: ${call.sid}`);
    return { callSid: call.sid, status: call.status };
  } catch (err) {
    console.error('[Outbound] Error:', err.message);
    return reply.code(500).send({ error: err.message });
  }
});

// Call status callback from Twilio
app.post('/api/call-status', async (req, reply) => {
  const { CallSid, CallStatus } = req.body || {};
  console.log(`[CallStatus] ${CallSid}: ${CallStatus}`);
  if (CallStatus === 'completed' || CallStatus === 'failed' || CallStatus === 'no-answer') {
    await cleanupSession(CallSid);
  }
  reply.send({ ok: true });
});

// Get active AI calls
app.get('/api/active-calls', async (req, reply) => {
  return callMemory.getActiveCalls();
});

// Get live transcript for a call
app.get('/api/call/:sid/transcript', async (req, reply) => {
  const callSid = req.params.sid;
  const session = sessions.get(callSid);
  if (!session) return reply.code(404).send({ error: 'Call not found' });
  return session.llm.getSummary();
});

// Human takeover — stop Maui, redirect to human agent
app.post('/api/call/:sid/takeover', async (req, reply) => {
  const callSid = req.params.sid;
  const session = sessions.get(callSid);
  if (!session) return reply.code(404).send({ error: 'Call not found' });

  // Stop TTS, disconnect STT
  session.tts.interrupt();
  session.stt.close();

  // Add a note to the transcript
  callMemory.addTranscript(callSid, 'system', 'Human agent took over the call');

  // TODO: Redirect the Twilio call to a conference/queue for the human agent
  // For now, just stop the AI
  const summary = session.llm.getSummary();
  sessions.delete(callSid);

  return { status: 'takeover', summary };
});

// Health check
app.get('/health', async () => {
  return {
    status: 'ok',
    activeCalls: sessions.size,
    uptime: process.uptime(),
  };
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen({ port: config.port, host: config.host }, (err, address) => {
  if (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
  console.log(`
╔══════════════════════════════════════════════════╗
║  🤙 Maui Voice Agent — LIVE                      ║
║  Server:    ${address.padEnd(37)}║
║  WebSocket: wss://*/media-stream                 ║
║  LLM:       Claude Sonnet 4.5 + Haiku fallback  ║
║  STT:       Deepgram Nova-2 (multilingual)       ║
║  TTS:       ElevenLabs Turbo v2.5                ║
║  Phone:     ${config.twilio.phoneNumber.padEnd(37)}║
╚══════════════════════════════════════════════════╝
  `);
});
