/**
 * Test Harness — Simulates Twilio Media Stream locally
 * Tests the full pipeline: STT → LLM → TTS without making real calls
 *
 * Usage: node test-harness.js [test-name]
 *   node test-harness.js pipeline    — Test LLM + TTS pipeline timing
 *   node test-harness.js tts         — Test TTS only
 *   node test-harness.js llm         — Test LLM only
 *   node test-harness.js websocket   — Simulate a full Twilio media stream session
 */

import { LLMHandler } from './llm-handler.js';
import { ElevenLabsTTS } from './tts-elevenlabs.js';
import { DeepgramSTT } from './stt-deepgram.js';
import { CallMemory } from './call-memory.js';
import WebSocket from 'ws';

const test = process.argv[2] || 'pipeline';

// ─── Timing helper ────────────────────────────────────────────────────────────
function timer(label) {
  const start = Date.now();
  return {
    elapsed: () => Date.now() - start,
    log: (msg) => console.log(`  [${label}] ${msg} (${Date.now() - start}ms)`),
    done: () => console.log(`  [${label}] Done (${Date.now() - start}ms)`),
  };
}

// ─── Test: LLM Only ──────────────────────────────────────────────────────────
async function testLLM() {
  console.log('\n🧠 Testing LLM (Claude Haiku)...\n');
  const llm = new LLMHandler();

  // Test 1: Outbound opening
  let t = timer('Opening');
  llm.setOutboundContext('Patrick');
  const opening = await llm.respond('[Start the outbound call now]');
  t.log(`Response: "${opening}"`);
  t.done();

  // Test 2: Simple greeting
  t = timer('Greeting');
  const greeting = await llm.respond('Hey, yeah this is Patrick');
  t.log(`Response: "${greeting}"`);
  t.done();

  // Test 3: Complex question
  t = timer('Complex');
  const complex = await llm.respond("I've got about $50,000 in credit card debt across 4 cards and I'm only making minimum payments. My income is around $4,000 a month. What can you do for me?");
  t.log(`Response: "${complex}"`);
  t.done();

  // Test 4: Spanish
  t = timer('Spanish');
  llm.reset();
  const spanish = await llm.respond('Hola, necesito ayuda con mis deudas');
  t.log(`Response: "${spanish}"`);
  t.done();

  // Test 5: Simple ack
  t = timer('Simple');
  const simple = await llm.respond('yes');
  t.log(`Response: "${simple}"`);
  t.done();

  console.log('\n✅ LLM tests complete\n');
}

// ─── Test: TTS Only ──────────────────────────────────────────────────────────
async function testTTS() {
  console.log('\n🔊 Testing TTS (ElevenLabs)...\n');
  const tts = new ElevenLabsTTS();

  const phrases = [
    "Hey, this is Maui. How can I help you today?",
    "Got it — fifty thousand in credit card debt. What's your monthly income?",
    "Hola, soy Maui. ¿En qué te puedo ayudar?",
  ];

  for (const phrase of phrases) {
    const t = timer('TTS');
    let chunks = 0;
    let totalBytes = 0;
    let firstChunkMs = 0;

    tts.removeAllListeners();
    tts.on('audio', (base64) => {
      chunks++;
      totalBytes += base64.length;
      if (chunks === 1) firstChunkMs = t.elapsed();
    });

    const ok = await tts.speak(phrase);
    t.log(`"${phrase.slice(0, 50)}..." → ${ok ? '✅' : '❌'} | ${chunks} chunks, ${totalBytes} bytes b64 | First chunk: ${firstChunkMs}ms`);
  }

  // Test interruption
  const t = timer('Interrupt');
  let interrupted = false;
  tts.removeAllListeners();
  tts.on('audio', () => {
    if (!interrupted) {
      interrupted = true;
      setTimeout(() => {
        tts.interrupt();
        t.log('Interrupted TTS mid-stream');
      }, 200);
    }
  });
  const ok = await tts.speak("This is a longer sentence that should get interrupted before it finishes playing because the caller started talking.");
  t.log(`Completed: ${ok} (should be false)`);

  console.log('\n✅ TTS tests complete\n');
}

// ─── Test: Full Pipeline (LLM + TTS) ─────────────────────────────────────────
async function testPipeline() {
  console.log('\n🔗 Testing Full Pipeline (LLM → TTS)...\n');

  const llm = new LLMHandler();
  const tts = new ElevenLabsTTS();

  // Simulate outbound call flow
  const scenarios = [
    { setup: () => { llm.setOutboundContext('Patrick'); }, input: '[Start the outbound call now]', label: 'Outbound opening' },
    { input: 'Yeah this is Patrick, what do you want?', label: 'Caller responds' },
    { input: "I have about 45 thousand in debt, mostly credit cards", label: 'Debt info' },
    { input: 'Four thousand a month before taxes', label: 'Income info' },
    { input: 'yes', label: 'Simple ack' },
  ];

  for (const scenario of scenarios) {
    if (scenario.setup) scenario.setup();

    const t = timer(scenario.label);
    let llmMs = 0;
    let firstAudioMs = 0;
    let gotFirstAudio = false;

    // Step 1: LLM
    const response = await llm.respond(scenario.input);
    llmMs = t.elapsed();

    // Step 2: TTS
    tts.removeAllListeners();
    tts.on('audio', () => {
      if (!gotFirstAudio) {
        firstAudioMs = t.elapsed();
        gotFirstAudio = true;
      }
    });

    await tts.speak(response);
    const totalMs = t.elapsed();

    console.log(`  [${scenario.label}]`);
    console.log(`    Input:  "${scenario.input.slice(0, 60)}"`);
    console.log(`    Output: "${response.slice(0, 80)}${response.length > 80 ? '...' : ''}"`);
    console.log(`    LLM: ${llmMs}ms | First audio: ${firstAudioMs}ms | Total: ${totalMs}ms`);
    console.log(`    ${firstAudioMs < 2000 ? '✅' : '⚠️'} ${firstAudioMs < 2000 ? 'Good latency' : 'HIGH LATENCY — caller hears silence!'}`);
    console.log();
  }

  console.log('✅ Pipeline tests complete\n');
}

// ─── Test: Simulated WebSocket Session ────────────────────────────────────────
async function testWebSocket() {
  console.log('\n🌐 Testing WebSocket Media Stream Simulation...\n');
  console.log('  This connects to the running voice agent server at ws://localhost:8100/media-stream');
  console.log('  and simulates a Twilio media stream session.\n');

  const ws = new WebSocket('ws://localhost:8100/media-stream');

  ws.on('open', () => {
    console.log('  [WS] Connected');

    // Send "connected" event
    ws.send(JSON.stringify({ event: 'connected', protocol: 'Call', version: '1.0.0' }));

    // Send "start" event (simulates Twilio stream start)
    ws.send(JSON.stringify({
      event: 'start',
      sequenceNumber: '1',
      start: {
        streamSid: 'MZ_TEST_STREAM_001',
        callSid: 'CA_TEST_CALL_001',
        accountSid: 'AC_TEST',
        tracks: ['inbound'],
        customParameters: {
          direction: 'inbound',
          callerNumber: '+15551234567',
          callerName: 'Test Caller',
        },
        mediaFormat: { encoding: 'audio/x-mulaw', sampleRate: 8000, channels: 1 },
      },
    }));

    console.log('  [WS] Sent start event');

    // Listen for media coming back (TTS audio)
    let audioChunks = 0;
    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.event === 'media') {
          audioChunks++;
          if (audioChunks === 1) console.log('  [WS] Receiving audio from Maui...');
          if (audioChunks % 20 === 0) console.log(`  [WS] ${audioChunks} audio chunks received`);
        } else if (msg.event === 'clear') {
          console.log('  [WS] Audio cleared (barge-in)');
        }
      } catch {}
    });

    // After 5 seconds, send "stop" to end the session
    setTimeout(() => {
      ws.send(JSON.stringify({ event: 'stop', sequenceNumber: '999', stop: { callSid: 'CA_TEST_CALL_001' } }));
      console.log(`  [WS] Sent stop. Total audio chunks received: ${audioChunks}`);
      setTimeout(() => {
        ws.close();
        console.log('  [WS] Closed\n✅ WebSocket test complete\n');
      }, 1000);
    }, 5000);
  });

  ws.on('error', (err) => {
    console.error('  [WS] Error:', err.message);
    console.log('  ⚠️  Is the voice agent server running? (node voice-agent.js)');
  });
}

// ─── Test: Deepgram STT Connection ───────────────────────────────────────────
async function testSTT() {
  console.log('\n🎤 Testing Deepgram STT Connection...\n');
  const stt = new DeepgramSTT();

  return new Promise((resolve) => {
    stt.on('connected', () => {
      console.log('  [STT] ✅ Connected to Deepgram');
      console.log('  [STT] Sending silence for 2 seconds...');

      // Send 2 seconds of silence (mulaw silence = 0xFF)
      const silenceChunk = Buffer.alloc(160, 0xFF); // 20ms of silence at 8kHz
      const interval = setInterval(() => stt.sendAudio(silenceChunk), 20);

      setTimeout(() => {
        clearInterval(interval);
        stt.close();
        console.log('  [STT] ✅ Sent silence, closed cleanly');
        resolve();
      }, 2000);
    });

    stt.on('error', (err) => {
      console.error('  [STT] ❌ Error:', err.message);
      resolve();
    });

    stt.on('transcript', (result) => {
      console.log(`  [STT] Transcript: "${result.text}" (final: ${result.isFinal})`);
    });

    stt.connect();
  });

  console.log('\n✅ STT test complete\n');
}

// ─── Run ──────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════');
console.log('  Maui Voice Agent — Test Harness');
console.log('═══════════════════════════════════════');

switch (test) {
  case 'llm':       await testLLM(); break;
  case 'tts':       await testTTS(); break;
  case 'pipeline':  await testPipeline(); break;
  case 'websocket': await testWebSocket(); break;
  case 'stt':       await testSTT(); break;
  case 'all':
    await testLLM();
    await testTTS();
    await testPipeline();
    await testSTT();
    break;
  default:
    console.log(`Unknown test: ${test}. Use: llm, tts, pipeline, websocket, stt, all`);
}
