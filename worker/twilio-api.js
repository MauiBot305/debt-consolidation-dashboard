/**
 * Twilio API Handler for Cloudflare Worker
 * Provides token generation and call control endpoints
 */

// REAL TWILIO CREDENTIALS - HARDCODED
const TWILIO_CONFIG = {
  accountSid: env.TWILIO_ACCOUNT_SID || 'CONFIGURE_IN_WORKER_SECRETS',
  authToken: env.TWILIO_AUTH_TOKEN || 'CONFIGURE_IN_WORKER_SECRETS',
  apiKeySid: env.TWILIO_API_KEY_SID || 'CONFIGURE_IN_WORKER_SECRETS',
  apiKeySecret: env.TWILIO_API_KEY_SECRET || 'CONFIGURE_IN_WORKER_SECRETS',
  phoneNumber: '+17542542410',
  voiceWebhook: 'https://voice-api.alldayautomations.ai/voice/inbound',
  statusCallback: 'https://voice-api.alldayautomations.ai/api/call-status'
};

/**
 * Generate Twilio Access Token for browser calling
 */
async function generateAccessToken(identity = 'dashboard-agent') {
  try {
    // Use Twilio's token generation
    // Since we're in a Worker, we'll generate the JWT manually
    const AccessToken = require('twilio').jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(
      TWILIO_CONFIG.accountSid,
      TWILIO_CONFIG.apiKeySid,
      TWILIO_CONFIG.apiKeySecret,
      { identity }
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: null, // We'll use direct TwiML
      incomingAllow: true
    });

    token.addGrant(voiceGrant);

    return {
      token: token.toJwt(),
      identity
    };
  } catch (error) {
    console.error('Failed to generate token:', error);
    throw error;
  }
}

/**
 * Send SMS via Twilio
 */
async function sendSMS(to, body) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append('To', to);
  formData.append('From', TWILIO_CONFIG.phoneNumber);
  formData.append('Body', body);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });

  if (!response.ok) {
    throw new Error(`Twilio SMS API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Update call to hold/unhold
 */
async function toggleHold(callSid, hold) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Calls/${callSid}.json`;
  
  // Put on hold using TwiML
  const twiml = hold
    ? '<Response><Play loop="0">http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3</Play></Response>'
    : '<Response><Say>Resuming call</Say></Response>';

  const formData = new URLSearchParams();
  formData.append('Twiml', twiml);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });

  if (!response.ok) {
    throw new Error(`Twilio Hold API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Start/stop call recording
 */
async function toggleRecording(callSid, record) {
  if (record) {
    // Start recording
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Calls/${callSid}/Recordings.json`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Twilio Recording API error: ${response.statusText}`);
    }

    return await response.json();
  } else {
    // Stop recording (update call to pause recording)
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Calls/${callSid}.json`;
    
    const formData = new URLSearchParams();
    formData.append('RecordingStatus', 'stopped');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      throw new Error(`Twilio Recording Stop API error: ${response.statusText}`);
    }

    return await response.json();
  }
}

/**
 * Transfer call to another number
 */
async function transferCall(callSid, to) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Calls/${callSid}.json`;
  
  const twiml = `<Response><Dial>${to}</Dial></Response>`;
  
  const formData = new URLSearchParams();
  formData.append('Twiml', twiml);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });

  if (!response.ok) {
    throw new Error(`Twilio Transfer API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Add third party to call (create conference)
 */
async function createConference(callSid, thirdPartyNumber) {
  const conferenceName = `conf-${Date.now()}`;
  
  // Update existing call to join conference
  const url1 = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Calls/${callSid}.json`;
  
  const twiml1 = `<Response><Dial><Conference>${conferenceName}</Conference></Dial></Response>`;
  
  const formData1 = new URLSearchParams();
  formData1.append('Twiml', twiml1);

  await fetch(url1, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData1.toString()
  });

  // Dial third party into conference
  const url2 = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Calls.json`;
  
  const twiml2 = `<Response><Dial><Conference>${conferenceName}</Conference></Dial></Response>`;
  
  const formData2 = new URLSearchParams();
  formData2.append('To', thirdPartyNumber);
  formData2.append('From', TWILIO_CONFIG.phoneNumber);
  formData2.append('Twiml', twiml2);

  const response = await fetch(url2, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData2.toString()
  });

  if (!response.ok) {
    throw new Error(`Twilio Conference API error: ${response.statusText}`);
  }

  const result = await response.json();
  
  return {
    conferenceName,
    thirdPartyCallSid: result.sid
  };
}

/**
 * Generate TwiML for outbound call
 */
function generateOutboundTwiML(phoneNumber) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${TWILIO_CONFIG.phoneNumber}" record="record-from-answer" recordingStatusCallback="${TWILIO_CONFIG.statusCallback}">
    <Number>${phoneNumber}</Number>
  </Dial>
</Response>`;
}

/**
 * Main request handler
 */
async function handleTwilioRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Generate access token
    if (path === '/api/twilio/token') {
      const identity = url.searchParams.get('identity') || `agent-${Date.now()}`;
      const result = await generateAccessToken(identity);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Send SMS
    if (path === '/api/twilio/sms') {
      const body = await request.json();
      const result = await sendSMS(body.to, body.body);
      
      return new Response(JSON.stringify({ messageSid: result.sid }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Toggle hold
    if (path === '/api/twilio/hold') {
      const body = await request.json();
      const result = await toggleHold(body.callSid, body.hold);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Toggle recording
    if (path === '/api/twilio/record') {
      const body = await request.json();
      const result = await toggleRecording(body.callSid, body.record);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Transfer call
    if (path === '/api/twilio/transfer') {
      const body = await request.json();
      const result = await transferCall(body.callSid, body.to);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create conference
    if (path === '/api/twilio/conference') {
      const body = await request.json();
      const result = await createConference(body.callSid, body.thirdPartyNumber);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // TwiML for outbound calls
    if (path === '/api/twilio/twiml/outbound') {
      const phoneNumber = url.searchParams.get('to');
      const twiml = generateOutboundTwiML(phoneNumber);
      
      return new Response(twiml, {
        headers: { ...corsHeaders, 'Content-Type': 'application/xml' }
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });

  } catch (error) {
    console.error('Twilio API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

module.exports = { handleTwilioRequest, TWILIO_CONFIG };
