/**
 * LLM Handler — Claude Haiku (fast) + OpenAI GPT-4o (smart fallback)
 *
 * Routing:
 *   Simple responses (greetings, acks, yes/no) → Claude Haiku (fastest)
 *   Complex (questions, multi-language, lookups) → Claude Haiku (try) → GPT-4o (fallback)
 */

import { config } from './config.js';

const SYSTEM_PROMPT = `You are Maui, an AI assistant for a debt consolidation company. You help callers understand their debt relief options.

RULES:
- Keep responses to 2-3 sentences MAX. Never ramble.
- Be warm, empathetic, professional. These people are stressed about money.
- If asked a question you don't know, say "Let me look that up" and check the dashboard.
- Speak in whatever language the caller uses. If they switch languages, switch with them seamlessly.
- Never give legal advice. Say "I can connect you with our team for that."
- Collect: name, phone, total debt amount, monthly income, types of debt
- If caller qualifies (debt > $10K, DTI > 40%), offer to enroll them
- Always confirm information back: "So you said your total debt is $45,000, is that correct?"
- Be interruptible — keep answers SHORT so callers can jump in
- End every call with clear next steps
- Sound natural, like a real person on the phone. Use contractions, casual language.
- NEVER start with "Great question" or filler. Get to the point.

LANGUAGE:
If the caller speaks Spanish, respond in Spanish.
If Portuguese, respond in Portuguese.
If French or Haitian Creole, respond accordingly.
Always match the caller's language naturally.`;

const SIMPLE_PATTERNS = [
  /^(hi|hello|hey|yo|sup|good morning|good afternoon|good evening|hola|oi|bonjour)/i,
  /^(yes|no|yeah|yep|nah|nope|sure|ok|okay|got it|thanks|thank you|bye|goodbye)/i,
  /^(si|sí|não|oui|non|merci)/i,
  /^.{0,15}$/,
];

function isSimple(text) {
  return SIMPLE_PATTERNS.some(p => p.test(text.trim()));
}

export class LLMHandler {
  constructor() {
    this.conversationHistory = [];
    this.detectedLanguage = 'en';
    this.callerInfo = {};
  }

  async respond(userText, context = {}) {
    if (context.language) this.detectedLanguage = context.language;
    this.conversationHistory.push({ role: 'user', content: userText });

    if (this.conversationHistory.length > 40) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    let response;
    try {
      // Always try Claude first (fastest)
      response = await this._callClaude(config.anthropic.fastModel, isSimple(userText) ? 100 : 250);
    } catch (err) {
      console.error('[LLM] Claude failed, trying OpenAI:', err.message);
      try {
        response = await this._callOpenAI(config.openai.model, 250);
      } catch (err2) {
        console.error('[LLM] OpenAI also failed:', err2.message);
        response = "I'm sorry, I had a technical hiccup. Could you repeat that?";
      }
    }

    this.conversationHistory.push({ role: 'assistant', content: response });
    return response;
  }

  async _callClaude(model, maxTokens) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.anthropic.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: SYSTEM_PROMPT,
        messages: this.conversationHistory,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Claude ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || "Could you say that again?";
  }

  async _callOpenAI(model, maxTokens) {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...this.conversationHistory,
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Could you say that again?";
  }

  setOutboundContext(leadName, leadInfo = {}) {
    this.callerInfo = { name: leadName, ...leadInfo };
    this.conversationHistory = [{
      role: 'user',
      content: `[SYSTEM: You are making an outbound call to ${leadName}. ${
        leadInfo.totalDebt ? `They have $${leadInfo.totalDebt} in debt.` : ''
      } Introduce yourself briefly and ask if you're speaking with ${leadName}. Keep it to ONE sentence.]`,
    }];
  }

  reset() {
    this.conversationHistory = [];
    this.detectedLanguage = 'en';
    this.callerInfo = {};
  }

  getSummary() {
    return {
      turns: this.conversationHistory.length,
      language: this.detectedLanguage,
      callerInfo: this.callerInfo,
      transcript: this.conversationHistory.map(m =>
        `${m.role === 'user' ? 'Caller' : 'Maui'}: ${m.content}`
      ).join('\n'),
    };
  }
}
