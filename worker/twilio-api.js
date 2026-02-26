/**
 * Twilio API Worker
 * Secrets managed via: npx wrangler secret put <KEY_NAME>
 * Required secrets: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_FROM_NUMBER, API_SECRET
 */

// Rate limiting (in-memory, resets on worker restart)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 100;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return false;
  return true;
}

/**
 * Input validation helpers (SEC-V2-002)
 */
function validateCallSid(sid) {
  if (!sid || !/^CA[0-9a-f]{32}$/i.test(sid)) {
    throw new Error('Invalid CallSid format');
  }
  return sid;
}

function validatePhoneNumber(num) {
  const cleaned = (num || '').replace(/[\s\-()]/g, '');
  if (!/^\+?[1-9]\d{6,14}$/.test(cleaned)) {
    throw new Error('Invalid phone number');
  }
  return cleaned;
}

/**
 * Authenticate incoming request via Bearer token
 */
function authenticateRequest(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ') || authHeader.slice(7) !== env.API_SECRET) {
    return false;
  }
  return true;
}

/**
 * Generate JWT token manually (Cloudflare Worker compatible)
 */
function generateTwilioJWT(accountSid, apiKeySid, apiKeySecret, identity) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = { cty: 'twilio-fpa;v=1', typ: 'JWT', alg: 'HS256' };
  const grants = { identity, voice: { incoming: { allow: true }, outgoing: { application_sid: null } } };
  const payload = { jti: `${apiKeySid}-${now}`, iss: apiKeySid, sub: accountSid, exp, grants };

  const base64url = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const encodedHeader = base64url(header);
  const encodedPayload = base64url(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  return crypto.subtle.importKey('raw', new TextEncoder().encode(apiKeySecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then(key => crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput)))
    .then(signature => {
      const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      return `${signingInput}.${base64Signature}`;
    });
}

async function generateAccessToken(env, identity = 'dashboard-agent') {
  const token = await generateTwilioJWT(env.TWILIO_ACCOUNT_SID, env.TWILIO_API_KEY_SID, env.TWILIO_API_KEY_SECRET, identity);
  // SEC-V2-009: Remove accountSid from response
  return { token, identity };
}

async function sendSMS(env, to, body) {
  // Validate phone number
  validatePhoneNumber(to);
  
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
  const formData = new URLSearchParams();
  formData.append('To', to);
  formData.append('From', env.TWILIO_FROM_NUMBER);
  formData.append('Body', body);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });
  if (!response.ok) throw new Error(`Twilio SMS API error: ${response.statusText}`);
  return await response.json();
}

async function toggleHold(env, callSid, hold) {
  // SEC-V2-002: Validate CallSid
  validateCallSid(callSid);
  
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`;
  const twiml = hold
    ? '<Response><Play loop="0">http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3</Play></Response>'
    : '<Response><Say>Resuming call</Say></Response>';
  const formData = new URLSearchParams();
  formData.append('Twiml', twiml);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });
  if (!response.ok) throw new Error(`Twilio Hold API error: ${response.statusText}`);
  return await response.json();
}

async function toggleRecording(env, callSid, record) {
  // SEC-V2-002: Validate CallSid
  validateCallSid(callSid);
  
  if (record) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${callSid}/Recordings.json`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`), 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    if (!response.ok) throw new Error(`Twilio Recording API error: ${response.statusText}`);
    return await response.json();
  } else {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`;
    const formData = new URLSearchParams();
    formData.append('RecordingStatus', 'stopped');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
    if (!response.ok) throw new Error(`Twilio Recording Stop API error: ${response.statusText}`);
    return await response.json();
  }
}

async function transferCall(env, callSid, to) {
  // SEC-V2-002: Validate inputs
  validateCallSid(callSid);
  validatePhoneNumber(to);
  
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`;
  // XML-escape the phone number
  const escaped = to.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const twiml = `<Response><Dial>${escaped}</Dial></Response>`;
  const formData = new URLSearchParams();
  formData.append('Twiml', twiml);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });
  if (!response.ok) throw new Error(`Twilio Transfer API error: ${response.statusText}`);
  return await response.json();
}

async function createConference(env, callSid, thirdPartyNumber) {
  // SEC-V2-002: Validate inputs
  validateCallSid(callSid);
  validatePhoneNumber(thirdPartyNumber);
  
  const conferenceName = `conf-${Date.now()}`;
  const url1 = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`;
  const twiml1 = `<Response><Dial><Conference>${conferenceName}</Conference></Dial></Response>`;
  const formData1 = new URLSearchParams();
  formData1.append('Twiml', twiml1);
  await fetch(url1, {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData1.toString()
  });

  const url2 = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls.json`;
  const twiml2 = `<Response><Dial><Conference>${conferenceName}</Conference></Dial></Response>`;
  const formData2 = new URLSearchParams();
  formData2.append('To', thirdPartyNumber);
  formData2.append('From', env.TWILIO_FROM_NUMBER);
  formData2.append('Twiml', twiml2);
  const response = await fetch(url2, {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData2.toString()
  });
  if (!response.ok) throw new Error(`Twilio Conference API error: ${response.statusText}`);
  const result = await response.json();
  return { conferenceName, thirdPartyCallSid: result.sid };
}

function generateOutboundTwiML(env, phoneNumber) {
  // SEC-V2-001: Validate E.164 format
  if (!phoneNumber || !/^\+?[1-9]\d{6,14}$/.test(phoneNumber.replace(/[\s\-()]/g, ''))) {
    throw new Error('Invalid phone number format');
  }
  // XML-escape
  const escaped = phoneNumber.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Dial callerId="${env.TWILIO_FROM_NUMBER}" record="record-from-answer">\n    <Number>${escaped}</Number>\n  </Dial>\n</Response>`;
}

/**
 * Main Cloudflare Worker fetch handler
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const requestId = crypto.randomUUID();

    // CORS headers - dynamic origin validation
    const allowedOrigins = ['https://debt.alldayautomations.ai', 'https://debt-consolidation-dashboard.pages.dev'];
    const requestOrigin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];
    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'X-Request-ID': requestId
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Content-length limit (1MB)
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > 1048576) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Try again later.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '600' } });
    }

    // Health check (no auth needed)
    if (path === '/health' || path === '/') {
      return new Response(JSON.stringify({ status: 'ok', service: 'Twilio API Worker', version: '2.0' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Authenticate all API routes
    if (path.startsWith('/api/')) {
      if (!authenticateRequest(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    try {
      if (path === '/api/twilio/token') {
        const identity = url.searchParams.get('identity') || `agent-${Date.now()}`;
        const result = await generateAccessToken(env, identity);
        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (path === '/api/twilio/sms') {
        const body = await request.json();
        const result = await sendSMS(env, body.to, body.body);
        return new Response(JSON.stringify({ success: true, messageSid: result.sid }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (path === '/api/twilio/hold') {
        const body = await request.json();
        const result = await toggleHold(env, body.callSid, body.hold);
        return new Response(JSON.stringify({ success: true, result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (path === '/api/twilio/record') {
        const body = await request.json();
        const result = await toggleRecording(env, body.callSid, body.record);
        return new Response(JSON.stringify({ success: true, result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (path === '/api/twilio/transfer') {
        const body = await request.json();
        const result = await transferCall(env, body.callSid, body.to);
        return new Response(JSON.stringify({ success: true, result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (path === '/api/twilio/conference') {
        const body = await request.json();
        const result = await createConference(env, body.callSid, body.thirdPartyNumber);
        return new Response(JSON.stringify({ success: true, result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (path === '/api/twilio/twiml/outbound') {
        const phoneNumber = url.searchParams.get('to');
        const twiml = generateOutboundTwiML(env, phoneNumber);
        return new Response(twiml, { headers: { ...corsHeaders, 'Content-Type': 'application/xml' } });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error) {
      console.error('Twilio API error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
