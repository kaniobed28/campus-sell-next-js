// lib/adminSessionManager.js
import { adminAuthService } from '@/services/adminAuthService';

class AdminSessionManager {
  constructor() {
    this.sessionKey = 'admin_session';
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
    this.warningTime = 5 * 60 * 1000; // 5 minutes before timeout
    this.checkInterval = 60 * 1000; // Check every minute
    this.intervalId = null;
    this.warningCallbacks = [];
    this.timeoutCallbacks = [];
  }

  /**
   * Start session monitoring
   */
  startSession(adminEmail) {
    const sessionData = {
      adminEmail,
      startTime: Date.now(),
      lastActivity: Date.now(),
      isActive: true
    };

    this.saveSession(sessionData);
    this.startMonitoring();
    
    // Track user activity
    this.trackActivity();
    
    console.log('Admin session started for:', adminEmail);
  }

  /**
   * End session
   */
  endSession() {
    this.clearSession();
    this.stopMonitoring();
    this.removeActivityTracking();
    
    console.log('Admin session ended');
  }

  /**
   * Update session activity
   */
  updateActivity() {
    const session = this.getSession();
    if (session && session.isActive) {
      session.lastActivity = Date.now();
      this.saveSession(session);
    }
  }

  /**
   * Check if session is valid
   */
  isSessionValid() {
    const session = this.getSession();
    if (!session || !session.isActive) return false;
    
    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    
    return timeSinceActivity < this.sessionTimeout;
  }

  /**
   * Get remaining session time
   */
  getRemainingTime() {
    const session = this.getSession();
    if (!session || !session.isActive) return 0;
    
    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    const remaining = this.sessionTimeout - timeSinceActivity;
    
    return Math.max(0, remaining);
  }

  /**
   * Extend session
   */
  extendSession() {
    const session = this.getSession();
    if (session && session.isActive) {
      session.lastActivity = Date.now();
      this.saveSession(session);
      console.log('Admin session extended');
      return true;
    }
    return false;
  }

  /**
   * Add warning callback
   */
  onSessionWarning(callback) {
    this.warningCallbacks.push(callback);
  }

  /**
   * Add timeout callback
   */
  onSessionTimeout(callback) {
    this.timeoutCallbacks.push(callback);
  }

  /**
   * Remove callback
   */
  removeCallback(callback) {
    this.warningCallbacks = this.warningCallbacks.filter(cb => cb !== callback);
    this.timeoutCallbacks = this.timeoutCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Start monitoring session
   */
  startMonitoring() {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      const remainingTime = this.getRemainingTime();
      
      if (remainingTime <= 0) {
        // Session expired
        this.handleSessionTimeout();
      } else if (remainingTime <= this.warningTime) {
        // Session warning
        this.handleSessionWarning(remainingTime);
      }
    }, this.checkInterval);
  }

  /**
   * Stop monitoring session
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Handle session warning
   */
  handleSessionWarning(remainingTime) {
    this.warningCallbacks.forEach(callback => {
      try {
        callback(remainingTime);
      } catch (error) {
        console.error('Session warning callback error:', error);
      }
    });
  }

  /**
   * Handle session timeout
   */
  handleSessionTimeout() {
    const session = this.getSession();
    
    this.timeoutCallbacks.forEach(callback => {
      try {
        callback(session);
      } catch (error) {
        console.error('Session timeout callback error:', error);
      }
    });
    
    this.endSession();
  }

  /**
   * Track user activity
   */
  trackActivity() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    this.activityHandler = () => {
      this.updateActivity();
    };
    
    events.forEach(event => {
      document.addEventListener(event, this.activityHandler, true);
    });
  }

  /**
   * Remove activity tracking
   */
  removeActivityTracking() {
    if (this.activityHandler) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      events.forEach(event => {
        document.removeEventListener(event, this.activityHandler, true);
      });
      
      this.activityHandler = null;
    }
  }

  /**
   * Save session to storage
   */
  saveSession(sessionData) {
    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to save admin session:', error);
    }
  }

  /**
   * Get session from storage
   */
  getSession() {
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Failed to get admin session:', error);
      return null;
    }
  }

  /**
   * Clear session from storage
   */
  clearSession() {
    try {
      localStorage.removeItem(this.sessionKey);
    } catch (error) {
      console.error('Failed to clear admin session:', error);
    }
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    const session = this.getSession();
    if (!session) return null;
    
    const now = Date.now();
    const duration = now - session.startTime;
    const timeSinceActivity = now - session.lastActivity;
    const remainingTime = this.getRemainingTime();
    
    return {
      adminEmail: session.adminEmail,
      startTime: new Date(session.startTime),
      lastActivity: new Date(session.lastActivity),
      duration,
      timeSinceActivity,
      remainingTime,
      isValid: this.isSessionValid(),
      isActive: session.isActive
    };
  }

  /**
   * Format time for display
   */
  formatTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Export singleton instance
export const adminSessionManager = new AdminSessionManager();
export default adminSessionManager;