/**
 * Call Memory — Conversation persistence + CRM integration
 * Stores transcripts, recognizes returning callers, updates lead records
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MEMORY_DIR = join(__dirname, 'call-logs');

export class CallMemory {
  constructor() {
    this.activeCalls = new Map(); // callSid → call data
    this._ensureDir();
  }

  async _ensureDir() {
    try { await mkdir(MEMORY_DIR, { recursive: true }); } catch {}
  }

  /**
   * Start tracking a new call
   */
  startCall(callSid, { from, to, direction, leadName, leadInfo }) {
    const call = {
      callSid,
      from,
      to,
      direction,
      leadName: leadName || null,
      leadInfo: leadInfo || {},
      startTime: new Date().toISOString(),
      transcript: [],
      language: 'en',
      status: 'active',
    };
    this.activeCalls.set(callSid, call);
    return call;
  }

  /**
   * Add a transcript entry
   */
  addTranscript(callSid, role, text, language) {
    const call = this.activeCalls.get(callSid);
    if (!call) return;
    call.transcript.push({
      role, // 'caller' or 'maui'
      text,
      timestamp: new Date().toISOString(),
    });
    if (language) call.language = language;
  }

  /**
   * End call and persist to disk
   */
  async endCall(callSid, summary = {}) {
    const call = this.activeCalls.get(callSid);
    if (!call) return null;

    call.endTime = new Date().toISOString();
    call.status = 'completed';
    call.summary = summary;
    call.durationMs = new Date(call.endTime) - new Date(call.startTime);

    // Save to file
    const date = call.startTime.slice(0, 10);
    const filename = `${date}_${callSid}.json`;
    await writeFile(join(MEMORY_DIR, filename), JSON.stringify(call, null, 2));

    // Update caller index
    await this._updateCallerIndex(call);

    this.activeCalls.delete(callSid);
    console.log(`[Memory] Call ${callSid} saved (${call.transcript.length} turns, ${Math.round(call.durationMs / 1000)}s)`);
    return call;
  }

  /**
   * Look up previous calls from a phone number
   */
  async getCallerHistory(phoneNumber) {
    try {
      const indexPath = join(MEMORY_DIR, 'caller-index.json');
      const raw = await readFile(indexPath, 'utf-8');
      const index = JSON.parse(raw);
      return index[phoneNumber] || null;
    } catch {
      return null;
    }
  }

  /**
   * Update the caller index with this call's info
   */
  async _updateCallerIndex(call) {
    const indexPath = join(MEMORY_DIR, 'caller-index.json');
    let index = {};
    try {
      const raw = await readFile(indexPath, 'utf-8');
      index = JSON.parse(raw);
    } catch {}

    const phone = call.from || call.to;
    if (!index[phone]) {
      index[phone] = { calls: [], name: null, language: 'en' };
    }

    const entry = index[phone];
    entry.calls.push({
      callSid: call.callSid,
      date: call.startTime,
      direction: call.direction,
      turns: call.transcript.length,
      durationMs: call.durationMs,
    });
    if (call.leadName) entry.name = call.leadName;
    entry.language = call.language;
    entry.lastCall = call.startTime;

    await writeFile(indexPath, JSON.stringify(index, null, 2));
  }

  /**
   * Get all active calls (for dashboard)
   */
  getActiveCalls() {
    return Array.from(this.activeCalls.values()).map(c => ({
      callSid: c.callSid,
      from: c.from,
      to: c.to,
      direction: c.direction,
      leadName: c.leadName,
      startTime: c.startTime,
      turns: c.transcript.length,
      language: c.language,
    }));
  }
}
