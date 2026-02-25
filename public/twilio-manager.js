/**
 * Twilio Manager - Auto-fallback between Real Client and Simulator
 */

class TwilioManager {
  constructor() {
    this.client = null;
    this.isUsingRealTwilio = false;
    this.initializationAttempted = false;
  }

  /**
   * Initialize Twilio (tries real, falls back to simulator)
   */
  async initialize(identity = null) {
    if (this.initializationAttempted) {
      return this.isUsingRealTwilio;
    }

    this.initializationAttempted = true;

    // Check if Twilio SDK is loaded
    const twilioSDKLoaded = typeof Twilio !== 'undefined' && Twilio.Device;
    
    if (twilioSDKLoaded && typeof TwilioClient !== 'undefined') {
// console.log('🔄 Attempting to initialize real Twilio client...');
      
      try {
        this.client = new TwilioClient();
        const success = await this.client.initialize(identity);
        
        if (success) {
          this.isUsingRealTwilio = true;
// console.log('✅ Using REAL Twilio for calling');
          this.showBanner('success', '✅ Real Twilio Connected - Live Calls Enabled');
          return true;
        }
      } catch (error) {
        console.warn('⚠️ Real Twilio initialization failed:', error);
      }
    }

    // Fallback to simulator
// console.log('📱 Falling back to Twilio Simulator');
    this.client = new TwilioSimulator();
    this.isUsingRealTwilio = false;
    this.showBanner('warning', '📱 Demo Mode - Simulator Active (Real calls require Twilio connection)');
    return false;
  }

  /**
   * Show banner to user
   */
  showBanner(type, message) {
    // Remove existing banner
    const existing = document.getElementById('twilio-status-banner');
    if (existing) {
      existing.remove();
    }

    const banner = document.createElement('div');
    banner.id = 'twilio-status-banner';
    banner.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      z-index: 10000;
      animation: slideDown 0.3s ease-out;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;

    if (type === 'success') {
      banner.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';
      banner.style.color = 'white';
      banner.style.border = '2px solid #22C55E';
    } else if (type === 'warning') {
      banner.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95))';
      banner.style.color = 'white';
      banner.style.border = '2px solid #F59E0B';
    } else {
      banner.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))';
      banner.style.color = 'white';
      banner.style.border = '2px solid #EF4444';
    }

    banner.textContent = message;
    document.body.appendChild(banner);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      banner.style.animation = 'slideUp 0.3s ease-out';
      setTimeout(() => banner.remove(), 300);
    }, 5000);
  }

  /**
   * Proxy all methods to the active client
   */
  dial(...args) {
    return this.client.dial(...args);
  }

  makeCall(...args) {
    return this.client.makeCall ? this.client.makeCall(...args) : this.client.dial(...args);
  }

  hangup(...args) {
    return this.client.hangup ? this.client.hangup(...args) : this.client.hangUp(...args);
  }

  hangUp(...args) {
    return this.hangup(...args);
  }

  toggleMute() {
    return this.client.toggleMute();
  }

  toggleHold() {
    return this.client.toggleHold();
  }

  toggleRecording() {
    return this.client.toggleRecording();
  }

  sendSMS(...args) {
    if (!this.client.sendSMS) {
      console.warn('SMS not supported in simulator mode');
      return Promise.resolve(null);
    }
    return this.client.sendSMS(...args);
  }

  addThirdParty(...args) {
    if (!this.client.addThirdParty) {
      console.warn('3-way calling not supported in simulator mode');
      return Promise.resolve(null);
    }
    return this.client.addThirdParty(...args);
  }

  transferCall(...args) {
    if (!this.client.transferCall) {
      console.warn('Call transfer not supported in simulator mode');
      return Promise.resolve(null);
    }
    return this.client.transferCall(...args);
  }

  on(...args) {
    return this.client.on(...args);
  }

  getCallHistory(...args) {
    return this.client.getCallHistory(...args);
  }

  getCallStats() {
    return this.client.getCallStats();
  }

  getCallbacks() {
    return this.client.getCallbacks();
  }

  scheduleCallback(...args) {
    return this.client.scheduleCallback(...args);
  }

  completeCallback(...args) {
    return this.client.completeCallback(...args);
  }

  saveCallHistory(...args) {
    return this.client.saveCallHistory(...args);
  }

  updateCallStats(...args) {
    return this.client.updateCallStats(...args);
  }

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
   * Check if using real Twilio
   */
  isRealTwilio() {
    return this.isUsingRealTwilio;
  }

  /**
   * Get client type
   */
  getClientType() {
    return this.isUsingRealTwilio ? 'Real Twilio' : 'Simulator';
  }
}

// Add CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
    
    @keyframes slideUp {
      from {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      to {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
    }
  `;
  document.head.appendChild(style);
}

// Export for use
if (typeof window !== 'undefined') {
  window.TwilioManager = TwilioManager;
}
