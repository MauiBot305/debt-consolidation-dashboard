/**
 * Twilio Configuration for Debt Consolidation Dashboard
 * 
 * In production, these values are loaded from Cloudflare Worker environment variables.
 * For local development, set these in a .env file (never commit real keys).
 */
const TWILIO_CONFIG = {
  // Set via Cloudflare Worker secrets or .env
  accountSid: window.__TWILIO_ACCOUNT_SID || 'YOUR_ACCOUNT_SID',
  authToken: window.__TWILIO_AUTH_TOKEN || 'YOUR_AUTH_TOKEN',
  fromNumber: '+17542542410',
  apiKeySid: window.__TWILIO_API_KEY_SID || 'YOUR_API_KEY_SID',
  apiKeySecret: window.__TWILIO_API_KEY_SECRET || 'YOUR_API_KEY_SECRET',
  
  // Feature flags
  enableRecording: true,
  enableTranscription: true,
  enableConference: true,
  
  // Webhook URLs (public, safe to commit)
  voiceWebhookUrl: 'https://voice-api.alldayautomations.ai/voice/inbound',
  statusCallbackUrl: 'https://voice-api.alldayautomations.ai/api/call-status',
  
  // Demo mode — automatically enabled when no real credentials are set
  get isDemoMode() {
    return !this.accountSid || this.accountSid === 'YOUR_ACCOUNT_SID';
  }
};

// Make available globally
window.TWILIO_CONFIG = TWILIO_CONFIG;
