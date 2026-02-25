/**
 * Voice Stack API Client
 * Fetches real call data from the deployed voice stack, with graceful fallback to DebtDB.
 */
const VoiceAPI = {
  BASE_URL: 'https://debt-voice-stack.fly.dev',
  _cache: { calls: null, callsTimestamp: 0 },
  CACHE_TTL: 30000, // 30 seconds

  async fetchCalls(limit = 100) {
    const now = Date.now();
    if (this._cache.calls && (now - this._cache.callsTimestamp) < this.CACHE_TTL) {
      return this._cache.calls;
    }
    try {
      const resp = await fetch(`${this.BASE_URL}/api/calls?limit=${limit}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const calls = (data.calls || []).map(c => this.normalizeCall(c));
      this._cache.calls = calls;
      this._cache.callsTimestamp = now;
      return calls;
    } catch (e) {
      console.warn('Voice stack unavailable, using local data:', e.message);
      return null; // signal to use fallback
    }
  },

  async fetchCallDetail(callSid) {
    try {
      const resp = await fetch(`${this.BASE_URL}/api/calls/${callSid}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.json();
    } catch (e) {
      console.warn('Failed to fetch call detail:', e.message);
      return null;
    }
  },

  /**
   * Normalize a voice stack call record to match the DebtDB shape
   * so existing rendering code works with both.
   */
  normalizeCall(c) {
    const recordingSid = this.extractRecordingSid(c.recording_url);
    return {
      id: c.call_sid,
      callSid: c.call_sid,
      leadName: c.from_number || 'Unknown',
      phone: c.from_number || c.to_number || 'N/A',
      fromNumber: c.from_number,
      toNumber: c.to_number,
      agent: 'AI Agent',
      agentName: 'AI Agent',
      agentId: 'ai',
      duration: c.duration || 0,
      disposition: this.mapStatus(c.status),
      createdAt: c.started_at || c.created_at,
      recording: recordingSid ? `${this.BASE_URL}/api/recordings/${recordingSid}` : null,
      recordingUrl: c.recording_url,
      transcript: c.transcript || null,
      status: c.status,
      direction: c.direction,
      _source: 'voice-stack'
    };
  },

  extractRecordingSid(url) {
    if (!url) return null;
    // Twilio recording URLs contain the SID like /Recordings/RExxxx
    const match = url.match(/Recordings\/(RE[a-f0-9]+)/i);
    return match ? match[1] : null;
  },

  mapStatus(status) {
    const map = {
      'completed': 'Answer',
      'no-answer': 'No Answer',
      'busy': 'Busy',
      'failed': 'No Answer',
      'initiated': 'In Progress',
      'ringing': 'In Progress',
      'in-progress': 'In Progress'
    };
    return map[status] || status || 'No Answer';
  },

  /**
   * Merge voice stack calls with local DebtDB calls, deduplicating by callSid.
   */
  async fetchAgentStatus() {
    try {
      const resp = await fetch(`${this.BASE_URL}/api/agent/status`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.json();
    } catch (e) {
      console.warn('Failed to fetch agent status:', e.message);
      return null;
    }
  },

  mergeCalls(voiceCalls, localCalls) {
    const seen = new Set();
    const merged = [];
    // Voice stack calls take priority
    for (const c of voiceCalls) {
      seen.add(c.callSid || c.id);
      merged.push(c);
    }
    // Add local-only calls
    for (const c of localCalls) {
      if (!seen.has(c.callSid) && !seen.has(c.id)) {
        merged.push(c);
      }
    }
    // Sort by date descending
    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return merged;
  }
};

window.VoiceAPI = VoiceAPI;
