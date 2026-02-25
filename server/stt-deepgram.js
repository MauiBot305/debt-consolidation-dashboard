/**
 * Deepgram Streaming Speech-to-Text
 * Streams mulaw audio from Twilio → Deepgram Nova-2 → transcription events
 */

import WebSocket from 'ws';
import { config } from './config.js';
import { EventEmitter } from 'events';

export class DeepgramSTT extends EventEmitter {
  constructor(options = {}) {
    super();
    this.ws = null;
    this.connected = false;
    this.language = options.language || 'multi'; // start with multi-language detection
    this.keepAliveInterval = null;
  }

  connect() {
    const params = new URLSearchParams({
      model: config.deepgram.model,
      encoding: 'mulaw',
      sample_rate: '8000',
      channels: '1',
      punctuate: 'true',
      interim_results: 'true',
      endpointing: '300',        // 300ms silence = end of utterance
      utterance_end_ms: '1000',
      vad_events: 'true',
      smart_format: 'true',
    });

    // Use multi-language detection or specific language
    if (this.language === 'multi') {
      params.set('detect_language', 'true');
    } else {
      params.set('language', this.language);
    }

    const url = `wss://api.deepgram.com/v1/listen?${params}`;

    this.ws = new WebSocket(url, {
      headers: { 'Authorization': `Token ${config.deepgram.apiKey}` },
    });

    this.ws.on('open', () => {
      this.connected = true;
      this.emit('connected');
      // Keep-alive every 10s
      this.keepAliveInterval = setInterval(() => {
        if (this.connected) {
          this.ws.send(JSON.stringify({ type: 'KeepAlive' }));
        }
      }, 10000);
    });

    this.ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);

        if (msg.type === 'Results' && msg.channel?.alternatives?.[0]) {
          const alt = msg.channel.alternatives[0];
          const transcript = alt.transcript?.trim();
          if (!transcript) return;

          const isFinal = msg.is_final;
          const detectedLang = msg.channel?.detected_language || this.language;
          const confidence = alt.confidence || 0;

          this.emit('transcript', {
            text: transcript,
            isFinal,
            language: detectedLang,
            confidence,
            speechFinal: msg.speech_final || false,
          });

          // Update language if detected
          if (detectedLang && detectedLang !== 'multi') {
            this.language = detectedLang;
          }
        }

        if (msg.type === 'UtteranceEnd') {
          this.emit('utteranceEnd');
        }
      } catch (e) {
        // ignore parse errors
      }
    });

    this.ws.on('error', (err) => {
      console.error('[Deepgram] Error:', err.message);
      this.emit('error', err);
    });

    this.ws.on('close', () => {
      this.connected = false;
      clearInterval(this.keepAliveInterval);
      this.emit('disconnected');
    });
  }

  sendAudio(audioBuffer) {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(audioBuffer);
    }
  }

  setLanguage(lang) {
    this.language = lang;
    // Deepgram doesn't support mid-stream language switch,
    // but we track it for the LLM to respond in the right language
  }

  close() {
    if (this.ws) {
      clearInterval(this.keepAliveInterval);
      if (this.connected) {
        this.ws.send(JSON.stringify({ type: 'CloseStream' }));
      }
      this.ws.close();
      this.connected = false;
    }
  }
}
