/**
 * Twilio API Worker
 * Secrets managed via: npx wrangler secret put <KEY_NAME>
 * Required secrets: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_FROM_NUMBER
 */

/**
 * Generate JWT token manually (Cloudflare Worker compatible)
 * Replaces Twilio's AccessToken library
 */
function generateTwilioJWT(accountSid, apiKeySid, apiKeySecret, identity) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // 1 hour expiration

  const header = {
    cty: 'twilio-fpa;v=1',
    typ: 'JWT',
    alg: 'HS256'
  };

  const grants = {
    identity: identity,
    voice: {
      incoming: { allow: true },
      outgoing: {
        application_sid: null
      }
    }
  };

  const payload = {
    jti: `${apiKeySid}-${now}`,
    iss: apiKeySid,
    sub: accountSid,
    exp: exp,
    grants: grants
  };

  // Base64 URL encode
  const base64url = (obj) => {
    return btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const encodedHeader = base64url(header);
  const encodedPayload = base64url(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // HMAC-SHA256 signature
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(apiKeySecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key => {
    return crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(signingInput)
    );
  }).then(signature => {
    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return `${signingInput}.${base64Signature}`;
  });
}

/**
 * Generate Twilio Access Token for browser calling
 */
async function generateAccessToken(env, identity = 'dashboard-agent') {
  try {
    const token = await generateTwilioJWT(
      env.TWILIO_ACCOUNT_SID,
      env.TWILIO_API_KEY_SID,
      env.TWILIO_API_KEY_SECRET,
      identity
    );

    return {
      token,
      identity,
      accountSid: env.TWILIO_ACCOUNT_SID
    };
  } catch (error) {
    console.error('Failed to generate token:', error);
    throw error;
  }
}

/**
 * Send SMS via Twilio
 */
async function sendSMS(env, to, body) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const formData = new URLSearchParams();
  formData.append('To', to);
  formData.append('From', env.TWILIO_FROM_NUMBER);
  formData.append('Body', body);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twilio SMS API error: ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Update call to hold/unhold
 */
async function toggleHold(env, callSid, hold) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`;
  
  const twiml = hold
    ? '<Response><Play loop="0">http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3</Play></Response>'
    : '<Response><Say>Resuming call</Say></Response>';

  const formData = new URLSearchParams();
  formData.append('Twiml', twiml);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`),
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
async function toggleRecording(env, callSid, record) {
  if (record) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${callSid}/Recordings.json`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Twilio Recording API error: ${response.statusText}`);
    }

    return await response.json();
  } else {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`;
    
    const formData = new URLSearchParams();
    formData.append('RecordingStatus', 'stopped');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`),
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
async function transferCall(env, callSid, to) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`;
  
  const twiml = `<Response><Dial>${to}</Dial></Response>`;
  
  const formData = new URLSearchParams();
  formData.append('Twiml', twiml);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`),
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
async function createConference(env, callSid, thirdPartyNumber) {
  const conferenceName = `conf-${Date.now()}`;
  
  // Update existing call to join conference
  const url1 = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`;
  
  const twiml1 = `<Response><Dial><Conference>${conferenceName}</Conference></Dial></Response>`;
  
  const formData1 = new URLSearchParams();
  formData1.append('Twiml', twiml1);

  await fetch(url1, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData1.toString()
  });

  // Dial third party into conference
  const url2 = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls.json`;
  
  const twiml2 = `<Response><Dial><Conference>${conferenceName}</Conference></Dial></Response>`;
  
  const formData2 = new URLSearchParams();
  formData2.append('To', thirdPartyNumber);
  formData2.append('From', env.TWILIO_FROM_NUMBER);
  formData2.append('Twiml', twiml2);

  const response = await fetch(url2, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`),
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
function generateOutboundTwiML(env, phoneNumber) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${env.TWILIO_FROM_NUMBER}" record="record-from-answer">
    <Number>${phoneNumber}</Number>
  </Dial>
</Response>`;
}

/**
 * Main Cloudflare Worker fetch handler
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers - dynamic origin validation
    const allowedOrigins = [
      'https://debt.alldayautomations.ai',
      'https://debt-consolidation-dashboard.pages.dev'
    ];
    const requestOrigin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0];
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Generate access token
      if (path === '/api/twilio/token') {
        const identity = url.searchParams.get('identity') || `agent-${Date.now()}`;
        const result = await generateAccessToken(env, identity);
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Send SMS
      if (path === '/api/twilio/sms') {
        const body = await request.json();
        const result = await sendSMS(env, body.to, body.body);
        
        return new Response(JSON.stringify({ success: true, messageSid: result.sid }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Toggle hold
      if (path === '/api/twilio/hold') {
        const body = await request.json();
        const result = await toggleHold(env, body.callSid, body.hold);
        
        return new Response(JSON.stringify({ success: true, result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Toggle recording
      if (path === '/api/twilio/record') {
        const body = await request.json();
        const result = await toggleRecording(env, body.callSid, body.record);
        
        return new Response(JSON.stringify({ success: true, result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Transfer call
      if (path === '/api/twilio/transfer') {
        const body = await request.json();
        const result = await transferCall(env, body.callSid, body.to);
        
        return new Response(JSON.stringify({ success: true, result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create conference
      if (path === '/api/twilio/conference') {
        const body = await request.json();
        const result = await createConference(env, body.callSid, body.thirdPartyNumber);
        
        return new Response(JSON.stringify({ success: true, result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // TwiML for outbound calls
      if (path === '/api/twilio/twiml/outbound') {
        const phoneNumber = url.searchParams.get('to');
        const twiml = generateOutboundTwiML(env, phoneNumber);
        
        return new Response(twiml, {
          headers: { ...corsHeaders, 'Content-Type': 'application/xml' }
        });
      }

      // Health check
      if (path === '/health' || path === '/') {
        return new Response(JSON.stringify({ 
          status: 'ok', 
          service: 'Twilio API Worker',
          phoneNumber: env.TWILIO_FROM_NUMBER 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Twilio API error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
