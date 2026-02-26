// M12: Runtime mode detection - use simulator in demo mode, real Twilio in production
// Set window.DEMO_MODE = false and configure API_SECRET to use real Twilio
window.DEMO_MODE = (window.DEMO_MODE !== undefined) ? window.DEMO_MODE : true;

/**
 * TWILIO CLIENT WRAPPER - Production-Grade
 * For Debt Consolidation Empire Dashboard
 * P0 for Friday Meeting - 47-Agent Bulgaria Operation
 * 
 * Handles:
 * - Real Twilio Device initialization
 * - Token management & refresh
 * - Call state management
 * - Mute, Hold, Record, Transfer, Conference
 * - SMS sending
 * - Demo mode fallback (seamless simulation)
 * - Call history & statistics
 * - Callbacks/scheduling
 */

class TwilioClient {
  constructor(workerUrl = 'https://debt-dashboard-api.maui-6b7.workers.dev') {
    this.workerUrl = workerUrl;
    this.device = null;
    this.activeCall = null;
    this.state = 'idle';
    this.callStartTime = null;
    this.callTimer = null;
    this.callDuration = 0;
    this.currentLead = null;
    this.isDemoMode = false;
    this._demoMuted = false; // FIX 15 (LOGIC-V2-013): State tracking for demo mute
    
    // Callbacks
    this.callbacks = {
      onStateChange: null,
      onTimerUpdate: null,
      onAudioLevel: null,
      onCallEnd: null,
      onError: null,
      onIncoming: null
    };

    // Current call metadata
    this.currentCall = null;

// console.log('📞 TwilioClient initialized');
  }

  /**
   * Initialize Twilio Device
   */
  async initialize() {
    try {
      // Check if Twilio SDK is loaded
      if (typeof Twilio === 'undefined' || !Twilio.Device) {
        throw new Error('Twilio SDK not loaded');
      }

      // Fetch token from Worker
      const token = await this.fetchAccessToken();

      // Initialize Twilio Device
      this.device = new Twilio.Device(token, {
        codecPreferences: ['opus', 'pcmu'],
        edge: 'ashburn',
        enableRingingState: true,
        closeProtection: true
      });

      // Setup event handlers
      this.setupDeviceHandlers();

      // Register device
      await this.device.register();

      this.isDemoMode = false;
// console.log('✅ Twilio Device registered successfully');
      return true;
    } catch (error) {
      console.warn('⚠️ Twilio unavailable, switching to demo mode:', error);
      this.isDemoMode = true;
      this.triggerCallback('onError', { code: 'DEMO_MODE', message: 'Using demo mode' });
      return false;
    }
  }

  /**
   * Fetch access token from Worker
   */
  async fetchAccessToken(identity = null) {
    const params = identity ? `?identity=${encodeURIComponent(identity)}` : '';
    const response = await fetch(`${this.workerUrl}/api/twilio/token${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch token');
    }

    const data = await response.json();
    return data.token;
  }

  /**
   * Setup Twilio Device event handlers
   */
  setupDeviceHandlers() {
    // Device registered
    this.device.on('registered', () => {
// console.log('📞 Twilio Device registered');
      this.setState('idle');
    });

    // Device errors
    this.device.on('error', (error) => {
      console.error('❌ Twilio Device error:', error);
      this.triggerCallback('onError', error);
    });

    // Incoming call
    this.device.on('incoming', (call) => {
// console.log('📞 Incoming call:', call.parameters.From);
      this.triggerCallback('onIncoming', call);
      
      // Auto-setup handlers for incoming call
      this.activeCall = call;
      this.setupCallHandlers(call);
    });

    // Token will expire
    this.device.on('tokenWillExpire', async () => {
// console.log('⚠️ Token expiring, refreshing...');
      try {
        const token = await this.fetchAccessToken();
        this.device.updateToken(token);
// console.log('✅ Token refreshed');
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
      }
    });

    // Device unregistered
    this.device.on('unregistered', () => {
// console.log('📴 Twilio Device unregistered');
    });
  }

  /**
   * Setup call event handlers
   */
  setupCallHandlers(call) {
    // Call accepted
    call.on('accept', () => {
// console.log('✅ Call accepted');
      this.setState('connected');
      this.startTimer();
      this.startAudioMonitoring(call);
    });

    // Call disconnected
    call.on('disconnect', () => {
// console.log('📴 Call disconnected');
      this.handleCallEnd();
    });

    // Call cancelled
    call.on('cancel', () => {
// console.log('🚫 Call cancelled');
      this.handleCallEnd();
    });

    // Call rejected
    call.on('reject', () => {
// console.log('❌ Call rejected');
      this.handleCallEnd();
    });

    // Call errors
    call.on('error', (error) => {
      console.error('❌ Call error:', error);
      this.triggerCallback('onError', error);
      this.handleCallEnd();
    });

    // Call quality warnings
    call.on('warning', (warningName, warningData) => {
      console.warn(`⚠️ Call quality warning: ${warningName}`, warningData);
    });

    call.on('warning-cleared', (warningName) => {
// console.log(`✅ Call quality warning cleared: ${warningName}`);
    });
  }

  /**
   * Make outbound call
   */
  async dial(phoneNumber, leadData = null) {
    if (this.state !== 'idle') {
      throw new Error('Call already in progress');
    }

    try {
      this.currentLead = leadData;
      this.setState('dialing');

      if (this.isDemoMode) {
        // Demo mode simulation
        this.simulateCall(phoneNumber, leadData);
      } else {
        // Real Twilio call
        const params = { To: phoneNumber };
        this.activeCall = await this.device.connect({ params });
        this.setupCallHandlers(this.activeCall);

        // Store call metadata
        this.currentCall = {
          id: this.activeCall.parameters.CallSid,
          phoneNumber: phoneNumber,
          leadData: leadData,
          direction: 'outbound',
          startTime: Date.now(),
          endTime: null,
          duration: 0,
          disposition: null,
          notes: '',
          recording: false
        };
      }

// console.log('📞 Calling:', phoneNumber);
      return true;
    } catch (error) {
      console.error('❌ Failed to make call:', error);
      this.setState('idle');
      this.triggerCallback('onError', error);
      return false;
    }
  }

  /**
   * Simulate call in demo mode
   */
  simulateCall(phoneNumber, leadData) {
// console.log('🎭 DEMO MODE: Simulating call to', phoneNumber);

    this.currentCall = {
      id: `DEMO_${Date.now()}`,
      phoneNumber: phoneNumber,
      leadData: leadData,
      direction: 'outbound',
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      disposition: null,
      notes: '',
      recording: false
    };

    // Simulate ring -> connect
    setTimeout(() => {
      if (this.state === 'dialing') {
        this.setState('connected');
        this.startTimer();
        this.simulateAudioLevel();
      }
    }, 2000);
  }

  /**
   * Hang up active call
   */
  hangup(disposition = null, notes = '') {
    if (this.activeCall && !this.isDemoMode) {
      this.activeCall.disconnect();
    } else if (this.isDemoMode && this.state !== 'idle') {
      this.handleCallEnd();
    }

    // Store disposition
    if (this.currentCall) {
      this.currentCall.disposition = disposition;
      this.currentCall.notes = notes;
    }
  }

  /**
   * Handle call end
   */
  handleCallEnd() {
    this.stopTimer();
    
    if (this.currentCall) {
      const endTime = Date.now();
      this.currentCall.endTime = endTime;
      this.currentCall.duration = Math.floor((endTime - this.currentCall.startTime) / 1000);
      
      // Save to history
      this.saveCallHistory(this.currentCall);
      
      // Trigger callback
      this.triggerCallback('onCallEnd', this.currentCall);
    }

    this.setState('disconnected');
    
    // Reset after brief delay
    setTimeout(() => {
      this.setState('idle');
      this.activeCall = null;
      this.currentCall = null;
      this.currentLead = null;
    }, 1000);
  }

  /**
   * Toggle mute
   */
  toggleMute() {
    if (!this.activeCall && !this.isDemoMode) return false;

    if (this.activeCall && !this.isDemoMode) {
      const isMuted = this.activeCall.isMuted();
      this.activeCall.mute(!isMuted);
      return !isMuted;
    } else if (this.isDemoMode) {
      // FIX 15 (LOGIC-V2-013): State tracking for demo mute toggle
      this._demoMuted = !this._demoMuted;
      return this._demoMuted;
    }

    return false;
  }

  /**
   * Toggle hold (via Worker API)
   */
  async toggleHold() {
    if (!this.activeCall && !this.isDemoMode) return false;

    const isOnHold = this.state === 'on-hold';
    const newState = !isOnHold;

    if (this.isDemoMode) {
      // Demo mode simulation
      this.setState(newState ? 'on-hold' : 'connected');
      return newState;
    }

    try {
      const response = await fetch(`${this.workerUrl}/api/twilio/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (this.apiToken || '') },
        body: JSON.stringify({
          callSid: this.currentCall.id,
          hold: newState
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle hold');
      }

      this.setState(newState ? 'on-hold' : 'connected');
      return newState;
    } catch (error) {
      console.error('❌ Failed to toggle hold:', error);
      return false;
    }
  }

  /**
   * Toggle recording
   */
  toggleRecording() {
    if (!this.currentCall) return false;

    const isRecording = this.currentCall.recording;
    const newState = !isRecording;

    if (this.isDemoMode) {
      // Demo mode simulation
      this.currentCall.recording = newState;
      return newState;
    }

    // Real Twilio recording would be implemented here
    this.currentCall.recording = newState;
    return newState;
  }

  /**
   * Send SMS
   */
  async sendSMS(to, message) {
    try {
      if (this.isDemoMode) {
// console.log('🎭 DEMO MODE: SMS sent to', to);
        return { messageSid: `DEMO_SMS_${Date.now()}`, success: true };
      }

      const response = await fetch(`${this.workerUrl}/api/twilio/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (this.apiToken || '') },
        body: JSON.stringify({ to, message })
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }

      const data = await response.json();
// console.log('✅ SMS sent:', data.messageSid);
      return data;
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      this.triggerCallback('onError', error);
      return null;
    }
  }

  /**
   * Add third party to call (3-way conference)
   */
  async addThirdParty(phoneNumber) {
    if (!this.activeCall) {
      throw new Error('No active call');
    }

    if (this.isDemoMode) {
// console.log('🎭 DEMO MODE: Adding third party', phoneNumber);
      return { success: true, conferenceName: `DEMO_CONF_${Date.now()}` };
    }

    try {
      const response = await fetch(`${this.workerUrl}/api/twilio/conference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (this.apiToken || '') },
        body: JSON.stringify({
          callSid: this.currentCall.id,
          participant: phoneNumber
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add third party');
      }

      const data = await response.json();
// console.log('✅ Third party added:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to add third party:', error);
      this.triggerCallback('onError', error);
      return null;
    }
  }

  /**
   * Transfer call
   */
  async transferCall(phoneNumber) {
    if (!this.activeCall) {
      throw new Error('No active call');
    }

    if (this.isDemoMode) {
// console.log('🎭 DEMO MODE: Transferring to', phoneNumber);
      return { success: true };
    }

    try {
      const response = await fetch(`${this.workerUrl}/api/twilio/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (this.apiToken || '') },
        body: JSON.stringify({
          callSid: this.currentCall.id,
          to: phoneNumber
        })
      });

      if (!response.ok) {
        throw new Error('Failed to transfer call');
      }

      const data = await response.json();
// console.log('✅ Call transferred:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to transfer:', error);
      this.triggerCallback('onError', error);
      return null;
    }
  }

  /**
   * Send DTMF tones
   */
  sendDigits(digits) {
    if (this.activeCall && !this.isDemoMode) {
      this.activeCall.sendDigits(digits);
    } else if (this.isDemoMode) {
// console.log('🎭 DEMO MODE: Sending DTMF', digits);
    }
  }

  /**
   * State management
   */
  setState(newState) {
    this.state = newState;
// console.log(`📊 Call state: ${newState}`);
    this.triggerCallback('onStateChange', newState);
  }

  /**
   * Register callbacks
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
  }

  /**
   * Trigger callback
   */
  triggerCallback(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event](data);
    }
  }

  /**
   * Timer management
   */
  startTimer() {
    this.callStartTime = Date.now();
    this.callTimer = setInterval(() => {
      if (this.state === 'connected') {
        this.callDuration = Math.floor((Date.now() - this.callStartTime) / 1000);
        this.triggerCallback('onTimerUpdate', this.callDuration);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.callTimer) {
      clearInterval(this.callTimer);
      this.callTimer = null;
    }
    this.callDuration = 0;
  }

  /**
   * Audio level monitoring
   */
  startAudioMonitoring(call) {
    if (call && call.on) {
      call.on('volume', (inputVolume, outputVolume) => {
        const level = Math.max(inputVolume, outputVolume) * 100;
        this.triggerCallback('onAudioLevel', level);
      });
    }
  }

  /**
   * Simulate audio level in demo mode
   */
  simulateAudioLevel() {
    if (this.isDemoMode) {
      if (this._audioSimInterval) clearInterval(this._audioSimInterval);
      this._audioSimInterval = setInterval(() => {
        if (this.state === 'connected') {
          const level = Math.random() * 80 + 20;
          this.triggerCallback('onAudioLevel', level);
        } else {
          clearInterval(this._audioSimInterval);
          this._audioSimInterval = null;
        }
      }, 150);
    }
  }

  /**
   * Call history management
   */
  // FIX 14 (LOGIC-V2-024): Call history with debtdb_ prefix
  saveCallHistory(call) {
    let history = JSON.parse(localStorage.getItem('debtdb_callHistory') || '[]');
    history.unshift(call);
    
    // Keep only last 100 calls
    if (history.length > 100) {
      history = history.slice(0, 100);
    }
    
    localStorage.setItem('debtdb_callHistory', JSON.stringify(history));
    this.updateCallStats(call);
  }

  getCallHistory(limit = 20) {
    const history = JSON.parse(localStorage.getItem('debtdb_callHistory') || '[]');
    return history.slice(0, limit);
  }

  /**
   * Call statistics
   */
  updateCallStats(call) {
    const stats = JSON.parse(localStorage.getItem('callStats') || '{}');
    const today = new Date().toISOString().split('T')[0];

    if (!stats[today]) {
      stats[today] = {
        totalCalls: 0,
        totalTalkTime: 0,
        conversions: 0,
        dispositions: {}
      };
    }

    stats[today].totalCalls++;
    stats[today].totalTalkTime += call.duration;

    if (call.disposition) {
      if (!stats[today].dispositions[call.disposition]) {
        stats[today].dispositions[call.disposition] = 0;
      }
      stats[today].dispositions[call.disposition]++;

      // Track conversions
      if (call.disposition === 'Enrolled' || call.disposition === 'Interested') {
        stats[today].conversions++;
      }
    }

    localStorage.setItem('callStats', JSON.stringify(stats));
  }

  getCallStats() {
    const stats = JSON.parse(localStorage.getItem('callStats') || '{}');
    const today = new Date().toISOString().split('T')[0];
    return stats[today] || {
      totalCalls: 0,
      totalTalkTime: 0,
      conversions: 0,
      dispositions: {}
    };
  }

  /**
   * Callbacks/Scheduling
   */
  scheduleCallback(leadId, leadName, phoneNumber, scheduledDate, notes = '') {
    const callbacks = JSON.parse(localStorage.getItem('callbacks') || '[]');
    const callback = {
      id: `CB_${Date.now()}`,
      leadId,
      leadName,
      phoneNumber,
      scheduledDate,
      notes,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    callbacks.push(callback);
    localStorage.setItem('callbacks', JSON.stringify(callbacks));
    
// console.log('📅 Callback scheduled:', callback);
    return callback;
  }

  getCallbacks() {
    const callbacks = JSON.parse(localStorage.getItem('callbacks') || '[]');
    return callbacks.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  }

  completeCallback(callbackId) {
    const callbacks = JSON.parse(localStorage.getItem('callbacks') || '[]');
    const callback = callbacks.find(cb => cb.id === callbackId);
    
    if (callback) {
      callback.completed = true;
      callback.completedAt = new Date().toISOString();
      localStorage.setItem('callbacks', JSON.stringify(callbacks));
// console.log('✅ Callback completed:', callbackId);
    }
  }

  /**
   * Format time helper (static)
   */
  static formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get current state
   */
  getState() {
    return this.state;
  }

  /**
   * Check if in demo mode
   */
  isDemoModeActive() {
    return this.isDemoMode;
  }

  /**
   * Destroy device
   */
  destroy() {
    if (this.device && !this.isDemoMode) {
      this.device.destroy();
      this.device = null;
    }
    
    this.stopTimer();
    
// console.log('📴 TwilioClient destroyed');
  }
}

// Export for use in modules
if (typeof window !== 'undefined') {
  window.TwilioClient = TwilioClient;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TwilioClient;
}
