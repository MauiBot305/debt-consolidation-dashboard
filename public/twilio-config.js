/**
 * Twilio Configuration
 * REAL credentials for production use
 */

const TWILIO_CONFIG = {
  // Account credentials
  accountSid: 'AC817583246f1bd0d4d71d0be44e65d938',
  authToken: '83c7a2a19ce4627b66632bb12873d2e9', // Don't expose in production!
  
  // API Key (safer for client-side)
  apiKeySid: 'SK81e414a5d4c572c269e00fb0c4257807',
  apiKeySecret: 'iioElfBXphoOp4yNtjgCsr0j1TMfsqGL', // Don't expose in production!
  
  // Dedicated dashboard phone number
  fromNumber: '+17542542410',
  phoneNumberSid: 'PN06a086bb385eab3a68caa5172db86c8e',
  
  // Webhooks
  voiceWebhook: 'https://voice-api.alldayautomations.ai/voice/inbound',
  statusCallback: 'https://voice-api.alldayautomations.ai/api/call-status',
  
  // Features
  capabilities: {
    voice: true,
    sms: true,
    mms: true
  },
  
  // API endpoints
  apiBase: 'https://api.twilio.com/2010-04-01',
  
  // Voice SDK
  sdkUrl: 'https://sdk.twilio.com/js/client/v1.14/twilio.min.js'
};

// Export for use
if (typeof window !== 'undefined') {
  window.TWILIO_CONFIG = TWILIO_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TWILIO_CONFIG;
}
