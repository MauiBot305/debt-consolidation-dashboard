/**
 * Twilio API Backend for Debt Consolidation Dashboard
 * Cloudflare Worker handling all Twilio interactions + Dashboard APIs
 */

// Import dashboard API handlers
import * as DashboardAPI from './dashboard-api.js';

// Twilio imports (using REST API directly via fetch)
const TWILIO_BASE = 'https://api.twilio.com/2010-04-01';

/**
 * Generate Twilio Access Token for browser-based calling
 */
async function generateAccessToken(env, identity = 'browser-client') {
  const AccessToken = await import('twilio').then(m => m.jwt.AccessToken);
  const VoiceGrant = AccessToken.VoiceGrant;

  const token = new AccessToken(
    env.TWILIO_ACCOUNT_SID,
    env.TWILIO_API_KEY,
    env.TWILIO_API_SECRET,
    { ttl: 3600, identity }
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: env.TWILIO_TWIML_APP_SID || undefined,
    incomingAllow: true,
  });

  token.addGrant(voiceGrant);

  return {
    identity,
    token: token.toJwt()
  };
}

/**
 * Make authenticated request to Twilio REST API
 */
async function twilioRequest(env, endpoint, method = 'GET', body = null) {
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const url = `${TWILIO_BASE}/Accounts/${env.TWILIO_ACCOUNT_SID}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = new URLSearchParams(body).toString();
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Twilio API request failed');
  }

  return data;
}

/**
 * CORS headers for browser requests
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handle CORS preflight
 */
function handleOptions() {
  return new Response(null, {
    headers: corsHeaders
  });
}

/**
 * JSON response helper
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

/**
 * Error response helper
 */
function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    try {
      // Route requests
      if (url.pathname === '/api/twilio/token') {
        return handleTokenRequest(request, env);
      }
      
      if (url.pathname === '/api/twilio/call') {
        return handleCallRequest(request, env);
      }
      
      if (url.pathname === '/api/twilio/sms') {
        return handleSMSRequest(request, env);
      }
      
      if (url.pathname === '/api/twilio/conference') {
        return handleConferenceRequest(request, env);
      }
      
      if (url.pathname === '/api/twilio/hold') {
        return handleHoldRequest(request, env);
      }
      
      if (url.pathname === '/api/twilio/transfer') {
        return handleTransferRequest(request, env);
      }
      
      if (url.pathname === '/api/twilio/record') {
        return handleRecordRequest(request, env);
      }
      
      if (url.pathname === '/api/twilio/voice') {
        return handleVoiceWebhook(request, env);
      }
      
      if (url.pathname === '/api/twilio/status') {
        return handleStatusCallback(request, env);
      }
      
      if (url.pathname === '/api/twilio/recording-complete') {
        return handleRecordingComplete(request, env);
      }

      // Dashboard API Routes
      if (url.pathname === '/api/dashboard/leads/search') {
        return DashboardAPI.searchLeads(request, env);
      }
      
      if (url.pathname.startsWith('/api/dashboard/leads/by-phone/')) {
        const phone = url.pathname.split('/').pop();
        return DashboardAPI.getLeadByPhone(phone, env);
      }
      
      if (url.pathname.startsWith('/api/dashboard/leads/') && url.pathname.split('/').length === 5) {
        const leadId = url.pathname.split('/').pop();
        return DashboardAPI.getLeadById(leadId, env);
      }
      
      if (url.pathname.startsWith('/api/dashboard/cases/')) {
        const caseId = url.pathname.split('/').pop();
        return DashboardAPI.getCaseById(caseId, env);
      }
      
      if (url.pathname === '/api/dashboard/pipeline/status') {
        return DashboardAPI.getPipelineStatus(env);
      }
      
      if (url.pathname === '/api/dashboard/agents/available') {
        return DashboardAPI.getAvailableAgents(env);
      }
      
      if (url.pathname.startsWith('/api/dashboard/agents/') && url.pathname.endsWith('/stats')) {
        const agentId = url.pathname.split('/')[4];
        return DashboardAPI.getAgentStats(agentId, env);
      }
      
      if (url.pathname === '/api/dashboard/analytics/summary') {
        return DashboardAPI.getAnalyticsSummary(env);
      }
      
      if (url.pathname.startsWith('/api/dashboard/compliance/')) {
        const clientId = url.pathname.split('/').pop();
        return DashboardAPI.getComplianceStatus(clientId, env);
      }
      
      if (url.pathname.startsWith('/api/dashboard/scripts/')) {
        const category = url.pathname.split('/').pop();
        return DashboardAPI.getScripts(category, env);
      }
      
      if (url.pathname === '/api/dashboard/calls/log') {
        return DashboardAPI.logCall(request, env);
      }

      return errorResponse('Endpoint not found', 404);
      
    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse(error.message, 500);
    }
  }
};

/**
 * Token Generation Endpoint
 * GET/POST /api/twilio/token
 */
async function handleTokenRequest(request, env) {
  try {
    const identity = new URL(request.url).searchParams.get('identity') || 
                    `browser-${Date.now()}`;

    // For Workers, we'll generate the JWT manually since we can't use the Node SDK
    const token = await generateTokenManually(env, identity);

    return jsonResponse({
      identity,
      token
    });
  } catch (error) {
    return errorResponse(`Failed to generate token: ${error.message}`);
  }
}

/**
 * Manually generate Twilio access token (Workers-compatible)
 */
async function generateTokenManually(env, identity) {
  const jwt = await import('jsonwebtoken');
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    jti: `${env.TWILIO_API_KEY}-${now}`,
    iss: env.TWILIO_API_KEY,
    sub: env.TWILIO_ACCOUNT_SID,
    exp: now + 3600,
    grants: {
      identity: identity,
      voice: {
        incoming: { allow: true },
        outgoing: {
          application_sid: env.TWILIO_TWIML_APP_SID || undefined
        }
      }
    }
  };

  return jwt.sign(payload, env.TWILIO_API_SECRET, { algorithm: 'HS256' });
}

/**
 * Outbound Call Endpoint
 * POST /api/twilio/call
 * Body: { to, from }
 */
async function handleCallRequest(request, env) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const { to, from } = await request.json();

    if (!to) {
      return errorResponse('Missing "to" parameter');
    }

    const callData = {
      To: to,
      From: from || env.TWILIO_PHONE_NUMBER,
      Url: `${new URL(request.url).origin}/api/twilio/voice`,
      StatusCallback: `${new URL(request.url).origin}/api/twilio/status`,
      StatusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      // Enable recording by default
      Record: 'record-from-answer-dual',
      RecordingChannels: 'dual',
      RecordingStatusCallback: `${new URL(request.url).origin}/api/twilio/recording-complete`
    };

    const call = await twilioRequest(env, '/Calls.json', 'POST', callData);

    return jsonResponse({
      callSid: call.sid,
      status: call.status,
      to: call.to,
      from: call.from
    });
  } catch (error) {
    return errorResponse(`Failed to initiate call: ${error.message}`);
  }
}

/**
 * SMS Send Endpoint
 * POST /api/twilio/sms
 * Body: { to, body }
 */
async function handleSMSRequest(request, env) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const { to, body } = await request.json();

    if (!to || !body) {
      return errorResponse('Missing "to" or "body" parameter');
    }

    const smsData = {
      To: to,
      From: env.TWILIO_PHONE_NUMBER,
      Body: body
    };

    const message = await twilioRequest(env, '/Messages.json', 'POST', smsData);

    return jsonResponse({
      messageSid: message.sid,
      status: message.status,
      to: message.to,
      from: message.from
    });
  } catch (error) {
    return errorResponse(`Failed to send SMS: ${error.message}`);
  }
}

/**
 * Conference/Third-Party Endpoint
 * POST /api/twilio/conference
 * Body: { callSid, thirdPartyNumber }
 */
async function handleConferenceRequest(request, env) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const { callSid, thirdPartyNumber } = await request.json();

    if (!callSid || !thirdPartyNumber) {
      return errorResponse('Missing callSid or thirdPartyNumber');
    }

    // Create conference name
    const conferenceName = `conf-${Date.now()}`;

    // Add current call to conference
    const updateData = {
      Url: generateConferenceTwiML(conferenceName)
    };

    await twilioRequest(env, `/Calls/${callSid}.json`, 'POST', updateData);

    // Dial third party into conference
    const thirdPartyCall = await twilioRequest(env, '/Calls.json', 'POST', {
      To: thirdPartyNumber,
      From: env.TWILIO_PHONE_NUMBER,
      Url: generateConferenceTwiML(conferenceName)
    });

    return jsonResponse({
      conferenceName,
      thirdPartyCallSid: thirdPartyCall.sid
    });
  } catch (error) {
    return errorResponse(`Failed to create conference: ${error.message}`);
  }
}

/**
 * Generate Conference TwiML
 */
function generateConferenceTwiML(conferenceName) {
  return `data:text/xml,${encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Dial>
        <Conference>${conferenceName}</Conference>
      </Dial>
    </Response>`)}`;
}

/**
 * Hold Endpoint
 * POST /api/twilio/hold
 * Body: { callSid, hold: true/false }
 */
async function handleHoldRequest(request, env) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const { callSid, hold } = await request.json();

    if (!callSid) {
      return errorResponse('Missing callSid');
    }

    const twiml = hold 
      ? generateHoldTwiML()
      : generateResumeTwiML();

    await twilioRequest(env, `/Calls/${callSid}.json`, 'POST', {
      Url: twiml
    });

    return jsonResponse({ status: hold ? 'on-hold' : 'resumed' });
  } catch (error) {
    return errorResponse(`Failed to update hold status: ${error.message}`);
  }
}

/**
 * Generate Hold TwiML
 */
function generateHoldTwiML() {
  return `data:text/xml,${encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Play loop="0">http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3</Play>
    </Response>`)}`;
}

/**
 * Generate Resume TwiML
 */
function generateResumeTwiML() {
  return `data:text/xml,${encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say>Resuming call.</Say>
    </Response>`)}`;
}

/**
 * Transfer Endpoint
 * POST /api/twilio/transfer
 * Body: { callSid, to }
 */
async function handleTransferRequest(request, env) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const { callSid, to } = await request.json();

    if (!callSid || !to) {
      return errorResponse('Missing callSid or to');
    }

    const twiml = `data:text/xml,${encodeURIComponent(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Dial>${to}</Dial>
      </Response>`)}`;

    await twilioRequest(env, `/Calls/${callSid}.json`, 'POST', {
      Url: twiml
    });

    return jsonResponse({ status: 'transferred', to });
  } catch (error) {
    return errorResponse(`Failed to transfer call: ${error.message}`);
  }
}

/**
 * Record Endpoint
 * POST /api/twilio/record
 * Body: { callSid, record: true/false }
 */
async function handleRecordRequest(request, env) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const { callSid, record } = await request.json();

    if (!callSid) {
      return errorResponse('Missing callSid');
    }

    if (record) {
      // Start recording
      const recording = await twilioRequest(
        env,
        `/Calls/${callSid}/Recordings.json`,
        'POST',
        {}
      );
      
      return jsonResponse({
        status: 'recording',
        recordingSid: recording.sid
      });
    } else {
      // Stop recording (update call to stop recording)
      await twilioRequest(env, `/Calls/${callSid}.json`, 'POST', {
        RecordingStatusCallback: `${new URL(request.url).origin}/api/twilio/recording-complete`
      });
      
      return jsonResponse({ status: 'stopped' });
    }
  } catch (error) {
    return errorResponse(`Failed to toggle recording: ${error.message}`);
  }
}

/**
 * Voice Webhook - Handle inbound/outbound call TwiML
 * POST /api/twilio/voice
 */
async function handleVoiceWebhook(request, env) {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="Polly.Matthew">Thank you for calling Debt Consolidation Services. Please hold while we connect you.</Say>
      <Dial>
        <Client>browser-client</Client>
      </Dial>
    </Response>`;

  return new Response(twiml, {
    headers: {
      'Content-Type': 'text/xml',
      ...corsHeaders
    }
  });
}

/**
 * Status Callback - Track call status changes
 * POST /api/twilio/status
 */
async function handleStatusCallback(request, env) {
  if (request.method !== 'POST') {
    return new Response('OK');
  }

  try {
    const formData = await request.formData();
    const status = {
      callSid: formData.get('CallSid'),
      status: formData.get('CallStatus'),
      duration: formData.get('CallDuration'),
      from: formData.get('From'),
      to: formData.get('To'),
      timestamp: new Date().toISOString()
    };

    // Log status (in production, save to KV or D1)
    console.log('Call status update:', status);

    // You can emit events to clients via WebSocket or store in KV for polling
    // For now, just acknowledge
    return new Response('OK');
  } catch (error) {
    console.error('Status callback error:', error);
    return new Response('Error', { status: 500 });
  }
}

/**
 * Recording Complete Callback - Download and save MP3
 * POST /api/twilio/recording-complete
 */
async function handleRecordingComplete(request, env) {
  if (request.method !== 'POST') {
    return new Response('OK');
  }

  try {
    const formData = await request.formData();
    const recordingData = {
      callSid: formData.get('CallSid'),
      recordingSid: formData.get('RecordingSid'),
      recordingUrl: formData.get('RecordingUrl'),
      recordingDuration: formData.get('RecordingDuration'),
      recordingChannels: formData.get('RecordingChannels'),
      from: formData.get('From'),
      to: formData.get('To'),
      timestamp: new Date().toISOString()
    };

    console.log('Recording complete:', recordingData);

    // In production, download MP3 and save to R2 bucket or external storage
    // For now, store metadata in KV for client retrieval
    if (env.RECORDINGS_KV) {
      await env.RECORDINGS_KV.put(
        `recording:${recordingData.recordingSid}`,
        JSON.stringify(recordingData)
      );
    }

    // Emit event to client (via WebSocket or polling endpoint)
    // Client will handle downloading if needed

    return new Response('OK');
  } catch (error) {
    console.error('Recording callback error:', error);
    return new Response('Error', { status: 500 });
  }
}
