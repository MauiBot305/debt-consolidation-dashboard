/**
 * Twilio Configuration for Debt Consolidation Dashboard
 * 
 * In production, these values are loaded from Cloudflare Worker environment variables.
 * For local development, set these in a .env file (never commit real keys).
 */
const TWILIO_CONFIG = {
  // Cloudflare Worker API endpoint (handles tokens and API calls)
  workerUrl: 'https://debt-dashboard-api.maui-6b7.workers.dev',
  
  // Phone number (public, safe to commit)
  fromNumber: '+17542542410',
  
  // Feature flags
  enableRecording: true,
  enableTranscription: true,
  enableConference: true,
  
  // Webhook URLs (public, safe to commit)
  voiceWebhookUrl: 'https://voice-api.alldayautomations.ai/voice/inbound',
  statusCallbackUrl: 'https://voice-api.alldayautomations.ai/api/call-status',
  
  // Demo mode — automatically disabled since we have a real Worker now
  get isDemoMode() {
    return false; // Real Twilio is always enabled via Worker
  }
};

// Make available globally
window.TWILIO_CONFIG = TWILIO_CONFIG;
