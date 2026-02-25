/**
 * Real Twilio Client for Browser-Based Calling
 * Using Twilio Voice JS SDK 2.x
 */

class TwilioClient {
  constructor() {
    this.device = null;
    this.activeCall = null;
    this.conferenceId = null;
    this.state = 'idle';
    this.callStartTime = null;
    this.callTimer = null;
    this.callDuration = 0;
    this.currentLead = null;
    this.callbacks = {
      onStateChange: null,
      onTimerUpdate: null,
      onAudioLevel: null,
      onCallEnd: null,
      onError: null
    };
    
    // API endpoint (change to your Worker URL after deployment)
    this.apiBase = window.location.origin;
  }

  /**
   * Initialize Twilio Device
   */
  async initialize(identity = null) {
    try {
      // Check if Twilio SDK is loaded
      if (typeof Twilio === 'undefined' || !Twilio.Device) {
        throw new Error('Twilio SDK not loaded. Please include the SDK script.');
      }

      // Fetch access token from backend
      const token = await this.fetchAccessToken(identity);
      
      // Initialize Twilio Device
      this.device = new Twilio.Device(token, {
        codecPreferences: ['opus', 'pcmu'],
        fakeLocalDTMF: true,
        enableRingingState: true
      });

      // Setup event handlers
      this.setupDeviceEvents();

      console.log('✅ Twilio Device initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Twilio:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
      return false;
    }
  }

  /**
   * Fetch access token from backend
   */
  async fetchAccessToken(identity = null) {
    const params = identity ? `?identity=${encodeURIComponent(identity)}` : '';
    const response = await fetch(`${this.apiBase}/api/twilio/token${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Twilio access token');
    }

    const data = await response.json();
    return data.token;
  }

  /**
   * Setup Twilio Device event handlers
   */
  setupDeviceEvents() {
    // Device ready
    this.device.on('registered', () => {
      console.log('📞 Twilio Device registered and ready');
      this.setState('idle');
    });

    // Device errors
    this.device.on('error', (error) => {
      console.error('❌ Twilio Device error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    });

    // Incoming call
    this.device.on('incoming', (call) => {
      console.log('📞 Incoming call:', call.parameters.From);
      this.handleIncomingCall(call);
    });

    // Device unregistered
    this.device.on('unregistered', () => {
      console.log('📴 Twilio Device unregistered');
    });

    // Token will expire soon
    this.device.on('tokenWillExpire', async () => {
      console.log('⚠️ Token expiring, refreshing...');
      const token = await this.fetchAccessToken();
      this.device.updateToken(token);
    });
  }

  /**
   * Setup call event handlers
   */
  setupCallEvents(call) {
    call.on('accept', () => {
      console.log('✅ Call accepted');
      this.setState('connected');
      this.startTimer();
    });

    call.on('disconnect', () => {
      console.log('📴 Call disconnected');
      this.handleCallEnd();
    });

    call.on('cancel', () => {
      console.log('🚫 Call cancelled');
      this.handleCallEnd();
    });

    call.on('reject', () => {
      console.log('❌ Call rejected');
      this.handleCallEnd();
    });

    call.on('error', (error) => {
      console.error('❌ Call error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    });

    // Audio level (volume) events
    call.on('volume', (inputVolume, outputVolume) => {
      if (this.callbacks.onAudioLevel) {
        // Normalize to 0-100
        const level = Math.max(inputVolume, outputVolume) * 100;
        this.callbacks.onAudioLevel(level);
      }
    });

    // Call quality warnings
    call.on('warning', (warningName, warningData) => {
      console.warn(`⚠️ Call quality warning: ${warningName}`, warningData);
    });

    call.on('warning-cleared', (warningName) => {
      console.log(`✅ Call quality warning cleared: ${warningName}`);
    });
  }

  /**
   * Make outbound call
   */
  async makeCall(phoneNumber, leadData = null) {
    if (!this.device) {
      throw new Error('Device not initialized. Call initialize() first.');
    }

    if (this.state !== 'idle') {
      throw new Error('Call already in progress');
    }

    try {
      this.currentLead = leadData;
      this.setState('dialing');

      // Make call via Twilio Device
      const call = await this.device.connect({
        params: {
          To: phoneNumber
        }
      });

      this.activeCall = call;
      this.setupCallEvents(call);

      // Save call metadata
      this.currentCall = {
        id: call.parameters.CallSid,
        phoneNumber: phoneNumber,
        leadData: leadData,
        startTime: Date.now(),
        endTime: null,
        duration: 0,
        disposition: null,
        notes: '',
        recording: false
      };

      console.log('📞 Calling:', phoneNumber);
      return true;
    } catch (error) {
      console.error('❌ Failed to make call:', error);
      this.setState('idle');
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
      return false;
    }
  }

  /**
   * Handle incoming call
   */
  handleIncomingCall(call) {
    this.activeCall = call;
    this.setupCallEvents(call);
    
    // Auto-accept or show UI to accept
    // For now, auto-accept
    call.accept();
    
    this.currentCall = {
      id: call.parameters.CallSid,
      phoneNumber: call.parameters.From,
      leadData: null,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      disposition: null,
      notes: '',
      recording: false,
      direction: 'inbound'
    };
  }

  /**
   * Hang up active call
   */
  async hangUp(disposition = null, notes = '') {
    if (!this.activeCall) {
      return;
    }

    try {
      this.activeCall.disconnect();
      
      // Save disposition
      if (this.currentCall) {
        this.currentCall.disposition = disposition;
        this.currentCall.notes = notes;
      }
    } catch (error) {
      console.error('❌ Failed to hang up:', error);
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
      if (this.callbacks.onCallEnd) {
        this.callbacks.onCallEnd(this.currentCall);
      }
    }

    this.setState('disconnected');
    
    // Reset to idle after brief delay
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
    if (!this.activeCall) return false;

    const isMuted = this.activeCall.isMuted();
    this.activeCall.mute(!isMuted);
    
    return !isMuted;
  }

  /**
   * Toggle hold (via API)
   */
  async toggleHold() {
    if (!this.activeCall) return false;

    const isOnHold = this.state === 'on-hold';
    const newState = !isOnHold;

    try {
      const response = await fetch(`${this.apiBase}/api/twilio/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
   * Start/stop recording
   */
  async toggleRecording() {
    if (!this.activeCall) return false;

    const isRecording = this.currentCall.recording;
    const newState = !isRecording;

    try {
      const response = await fetch(`${this.apiBase}/api/twilio/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callSid: this.currentCall.id,
          record: newState
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle recording');
      }

      this.currentCall.recording = newState;
      return newState;
    } catch (error) {
      console.error('❌ Failed to toggle recording:', error);
      return false;
    }
  }

  /**
   * Send SMS
   */
  async sendSMS(to, body) {
    try {
      const response = await fetch(`${this.apiBase}/api/twilio/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, body })
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }

      const data = await response.json();
      console.log('✅ SMS sent:', data.messageSid);
      return data;
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
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

    try {
      const response = await fetch(`${this.apiBase}/api/twilio/conference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callSid: this.currentCall.id,
          thirdPartyNumber: phoneNumber
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add third party');
      }

      const data = await response.json();
      this.conferenceId = data.conferenceName;
      console.log('✅ Third party added to conference:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to add third party:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
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

    try {
      const response = await fetch(`${this.apiBase}/api/twilio/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callSid: this.currentCall.id,
          to: phoneNumber
        })
      });

      if (!response.ok) {
        throw new Error('Failed to transfer call');
      }

      const data = await response.json();
      console.log('✅ Call transferred:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to transfer:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
      return null;
    }
  }

  /**
   * Send DTMF tones
   */
  sendDigits(digits) {
    if (!this.activeCall) return;
    this.activeCall.sendDigits(digits);
  }

  /**
   * State management
   */
  setState(newState) {
    this.state = newState;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(newState);
    }
  }

  /**
   * Register callbacks
   */
  on(event, callback) {
    this.callbacks[event] = callback;
  }

  /**
   * Timer management
   */
  startTimer() {
    this.callStartTime = Date.now();
    this.callTimer = setInterval(() => {
      if (this.state === 'connected') {
        this.callDuration = Math.floor((Date.now() - this.callStartTime) / 1000);
        if (this.callbacks.onTimerUpdate) {
          this.callbacks.onTimerUpdate(this.callDuration);
        }
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
   * Call history management
   */
  saveCallHistory(call) {
    let history = JSON.parse(localStorage.getItem('callHistory') || '[]');
    history.unshift(call);
    if (history.length > 100) {
      history = history.slice(0, 100);
    }
    localStorage.setItem('callHistory', JSON.stringify(history));
    this.updateCallStats(call);
  }

  getCallHistory(limit = 20) {
    const history = JSON.parse(localStorage.getItem('callHistory') || '[]');
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

      if (call.disposition === 'enrolled') {
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
   * Callbacks management
   */
  getCallbacks() {
    const callbacks = JSON.parse(localStorage.getItem('callbacks') || '[]');
    return callbacks.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  }

  scheduleCallback(leadId, leadName, phoneNumber, scheduledDate, notes = '') {
    const callbacks = JSON.parse(localStorage.getItem('callbacks') || '[]');
    callbacks.push({
      id: `CB_${Date.now()}`,
      leadId,
      leadName,
      phoneNumber,
      scheduledDate,
      notes,
      completed: false,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('callbacks', JSON.stringify(callbacks));
  }

  completeCallback(callbackId) {
    const callbacks = JSON.parse(localStorage.getItem('callbacks') || '[]');
    const callback = callbacks.find(cb => cb.id === callbackId);
    if (callback) {
      callback.completed = true;
      localStorage.setItem('callbacks', JSON.stringify(callbacks));
    }
  }

  /**
   * Format time helper
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
   * Destroy device
   */
  destroy() {
    if (this.device) {
      this.device.destroy();
      this.device = null;
    }
    this.stopTimer();
  }
}

// Export for use in PowerDialer
if (typeof window !== 'undefined') {
  window.TwilioClient = TwilioClient;
}
