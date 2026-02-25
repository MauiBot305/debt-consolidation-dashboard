/**
 * ElevenLabs Streaming Text-to-Speech
 * Streams text → ElevenLabs → mulaw 8kHz audio chunks for Twilio
 * Supports mid-stream interruption (barge-in)
 */

import { config } from './config.js';
import { EventEmitter } from 'events';

export class ElevenLabsTTS extends EventEmitter {
  constructor() {
    super();
    this.abortController = null;
    this.isSpeaking = false;
    this.streamId = 0; // Track which stream is active for interruption
  }

  /**
   * Stream text to speech, emitting base64 mulaw audio chunks.
   * Returns a promise that resolves when done (or interrupted).
   * @param {string} text - Text to speak
   * @returns {Promise<boolean>} true if completed, false if interrupted
   */
  async speak(text) {
    // Cancel any in-progress speech
    this.interrupt();

    const currentStreamId = ++this.streamId;
    this.abortController = new AbortController();
    this.isSpeaking = true;
    this.emit('speakStart', text);

    try {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${config.elevenlabs.voiceId}/stream`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': config.elevenlabs.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/basic', // mulaw
        },
        body: JSON.stringify({
          text,
          model_id: config.elevenlabs.model,
          output_format: config.elevenlabs.outputFormat,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.2,
          },
          optimize_streaming_latency: 3, // Aggressive latency optimization
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`ElevenLabs API error ${response.status}: ${errText}`);
      }

      const reader = response.body.getReader();
      let totalBytes = 0;

      while (true) {
        // Check if this stream was interrupted
        if (currentStreamId !== this.streamId) return false;

        const { done, value } = await reader.read();
        if (done) break;

        // Emit audio chunk as base64 for Twilio
        const base64Audio = Buffer.from(value).toString('base64');
        this.emit('audio', base64Audio);
        totalBytes += value.length;
      }

      this.isSpeaking = false;
      this.emit('speakEnd', { totalBytes });
      return true;

    } catch (err) {
      if (err.name === 'AbortError') {
        // Interrupted — expected during barge-in
        return false;
      }
      console.error('[ElevenLabs] TTS error:', err.message);
      this.emit('error', err);
      this.isSpeaking = false;
      return false;
    }
  }

  /**
   * Immediately stop current speech (for barge-in)
   */
  interrupt() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isSpeaking = false;
    this.streamId++;
    this.emit('interrupted');
  }
}
