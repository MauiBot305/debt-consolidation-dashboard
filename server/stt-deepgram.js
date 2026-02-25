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
    this.language = options.language || 'en';
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
      endpointing: '300',
      utterance_end_ms: '1000',
      vad_events: 'true',
      smart_format: 'true',
      language: this.language,
    });

    const url = `wss://api.deepgram.com/v1/listen?${params}`;

    try {
      this.ws = new WebSocket(url, {
        headers: { 'Authorization': `Token ${config.deepgram.apiKey}` },
      });
    } catch (err) {
      console.error('[Deepgram] Failed to create WebSocket:', err.message);
      return;
    }

    this.ws.on('open', () => {
      this.connected = true;
      console.log('[Deepgram] Connected');
      this.emit('connected');
      this.keepAliveInterval = setInterval(() => {
        if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
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

          this.emit('transcript', {
            text: transcript,
            isFinal: msg.is_final,
            language: msg.channel?.detected_language || this.language,
            confidence: alt.confidence || 0,
            speechFinal: msg.speech_final || false,
          });
        }

        if (msg.type === 'UtteranceEnd') {
          this.emit('utteranceEnd');
        }
      } catch (e) {
        // ignore parse errors
      }
    });

    this.ws.on('error', (err) => {
      console.error('[Deepgram] WebSocket error:', err.message);
      // Don't re-emit — handle gracefully
    });

    this.ws.on('close', (code, reason) => {
      this.connected = false;
      clearInterval(this.keepAliveInterval);
      console.log('[Deepgram] Disconnected:', code, reason?.toString());
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
  }

  close() {
    clearInterval(this.keepAliveInterval);
    if (this.ws) {
      try {
        if (this.connected) {
          this.ws.send(JSON.stringify({ type: 'CloseStream' }));
        }
        this.ws.close();
      } catch {}
      this.connected = false;
    }
  }
}
