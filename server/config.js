/**
 * Voice Agent Configuration — hardcoded for reliability
 */

export const config = {
  port: 8100,
  host: '0.0.0.0',
  publicUrl: 'https://treasonably-typal-audrea.ngrok-free.dev',

  twilio: {
    accountSid: 'AC817583246f1bd0d4d71d0be44e65d938',
    authToken: '83c7a2a19ce4627b66632bb12873d2e9',
    apiKey: 'SK81e414a5d4c572c269e00fb0c4257807',
    apiSecret: 'iioElfBXphoOp4yNtjgCsr0j1TMfsqGL',
    phoneNumber: '+17866487417',
  },

  anthropic: {
    apiKey: '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',
    fastModel: 'claude-3-haiku-20240307',
    smartModel: 'claude-3-haiku-20240307',
    sonnetTimeoutMs: 3000,
  },

  openai: {
    apiKey: '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',
    model: 'gpt-4o',
  },

  elevenlabs: {
    apiKey: 'sk_9ab34c79f1b8d14569ea4571ffd8a68c40b225d82cde5ff1',
    voiceId: 'sDgntYpZw3syMmKQFfje',
    model: 'eleven_turbo_v2_5',
    outputFormat: 'ulaw_8000',
  },

  deepgram: {
    apiKey: '739883d64984da2a3cb6c66f0bba6a40289c30ac',
    model: 'nova-2',
    languages: ['en', 'es', 'pt', 'fr', 'ht'],
  },

  bargeIn: {
    interimThreshold: 3,
    silenceMs: 700,
  },
};
