// Twilio Simulation Engine for Power Dialer
class TwilioSimulator {
  constructor() {
    this.state = 'idle'; // idle, dialing, connected, on-hold, disconnected
    this.currentCall = null;
    this.callTimer = null;
    this.callStartTime = null;
    this.callDuration = 0;
    this.audioLevel = 0;
    this.audioInterval = null;
    this.callbacks = {
      onStateChange: null,
      onTimerUpdate: null,
      onAudioLevel: null,
      onCallEnd: null
    };
  }

  // State management
  setState(newState) {
    this.state = newState;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(newState);
    }
  }

  // Register callbacks
  on(event, callback) {
    this.callbacks[event] = callback;
  }

  // Dial a number
  dial(phoneNumber, leadData = null) {
    if (this.state !== 'idle') {
      console.warn('Call already in progress');
      return false;
    }

    this.currentCall = {
      id: `CALL_${Date.now()}`,
      phoneNumber: phoneNumber,
      leadData: leadData,
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      disposition: null,
      notes: '',
      recording: false
    };

    this.setState('dialing');

    // Simulate connection after 2-4 seconds
    const connectionDelay = 2000 + Math.random() * 2000;
    setTimeout(() => {
      if (this.state === 'dialing') {
        this.connect();
      }
    }, connectionDelay);

    return true;
  }

  // Connect the call
  connect() {
    this.setState('connected');
    this.callStartTime = Date.now();
    this.startTimer();
    this.startAudioSimulation();
  }

  // Hang up
  hangup(disposition = null, notes = '') {
    if (this.state === 'idle') return;

    const endTime = Date.now();
    this.currentCall.endTime = endTime;
    this.currentCall.duration = Math.floor((endTime - this.currentCall.startTime) / 1000);
    this.currentCall.disposition = disposition;
    this.currentCall.notes = notes;

    // Save to call history
    this.saveCallHistory(this.currentCall);

    // Trigger callback
    if (this.callbacks.onCallEnd) {
      this.callbacks.onCallEnd(this.currentCall);
    }

    // Reset state
    this.stopTimer();
    this.stopAudioSimulation();
    this.setState('disconnected');
    
    // Return to idle after 1 second
    setTimeout(() => {
      this.setState('idle');
      this.currentCall = null;
    }, 1000);
  }

  // Mute/unmute
  toggleMute() {
    if (this.currentCall) {
      this.currentCall.muted = !this.currentCall.muted;
      return this.currentCall.muted;
    }
    return false;
  }

  // Hold/unhold
  toggleHold() {
    if (this.state === 'connected') {
      this.setState('on-hold');
      this.stopAudioSimulation();
      return true;
    } else if (this.state === 'on-hold') {
      this.setState('connected');
      this.startAudioSimulation();
      return false;
    }
    return false;
  }

  // Toggle recording
  toggleRecording() {
    if (this.currentCall) {
      this.currentCall.recording = !this.currentCall.recording;
      return this.currentCall.recording;
    }
    return false;
  }

  // Transfer (simulated)
  transfer(targetNumber) {
    if (this.state === 'connected') {
      console.log(`Transferring call to ${targetNumber}`);
      // In a real implementation, this would transfer the call
      return true;
    }
    return false;
  }

  // Timer management
  startTimer() {
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

  // Audio level simulation
  startAudioSimulation() {
    this.audioInterval = setInterval(() => {
      // Simulate varying audio levels
      this.audioLevel = Math.random() * 100;
      if (this.callbacks.onAudioLevel) {
        this.callbacks.onAudioLevel(this.audioLevel);
      }
    }, 100);
  }

  stopAudioSimulation() {
    if (this.audioInterval) {
      clearInterval(this.audioInterval);
      this.audioInterval = null;
    }
    this.audioLevel = 0;
  }

  // Call history management
  saveCallHistory(call) {
    let history = JSON.parse(localStorage.getItem('callHistory') || '[]');
    history.unshift(call);
    // Keep only last 100 calls
    if (history.length > 100) {
      history = history.slice(0, 100);
    }
    localStorage.setItem('callHistory', JSON.stringify(history));

    // Update call stats
    this.updateCallStats(call);
  }

  getCallHistory(limit = 20) {
    const history = JSON.parse(localStorage.getItem('callHistory') || '[]');
    return history.slice(0, limit);
  }

  // Call statistics
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

      // Count enrolled as conversions
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

  // Callback management
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

  // Format time helper
  static formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// Export for use in PowerDialer
if (typeof window !== 'undefined') {
  window.TwilioSimulator = TwilioSimulator;
}
