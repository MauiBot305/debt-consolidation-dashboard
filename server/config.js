/**
 * Voice Agent Configuration
 * All credentials and settings in one place
 */

export const config = {
  port: parseInt(process.env.PORT || '8100'),
  host: process.env.HOST || '0.0.0.0',

  // Public URL for Twilio webhooks (ngrok or production URL)
  publicUrl: process.env.PUBLIC_URL || 'https://treasonably-typal-audrea.ngrok-free.dev',

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    apiKey: process.env.TWILIO_API_KEY || '',
    apiSecret: process.env.TWILIO_API_SECRET || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    sonnetModel: 'claude-sonnet-4-5-20250514',
    haikuModel: 'claude-haiku-4-5-20250514',
    sonnetTimeoutMs: 3000, // Fall back to Haiku if Sonnet exceeds this
  },

  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    voiceId: process.env.ELEVENLABS_VOICE_ID || '',
    model: 'eleven_turbo_v2_5',
    outputFormat: 'ulaw_8000', // Twilio native format
  },

  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY || '',
    model: 'nova-2',
    languages: ['en', 'es', 'pt', 'fr', 'ht'],
  },

  // Barge-in settings
  bargeIn: {
    interimThreshold: 3, // # of interim words before cutting TTS
    silenceMs: 700,      // ms of silence before processing utterance
  },
};
