/**
 * AutoSetupManager - Handles automatic background setup of the marketplace
 * Eliminates the need for users to see setup screens or perform manual initialization
 */

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { initializeCategories } from '@/scripts/initializeCategories';
import { setupFirebaseStructure } from '@/scripts/setupFirebaseStructure';

// Setup status constants
export const SETUP_STATUS = {
  PENDING: 'pending',
  INITIALIZING: 'initializing', 
  READY: 'ready',
  ERROR: 'error'
};

// Retry configuration
const RETRY_CONFIG = {
  database: { maxRetries: 5, baseDelay: 1000 },
  categories: { maxRetries: 3, baseDelay: 500 },
  structure: { maxRetries: 5, baseDelay: 2000 }
};

class AutoSetupManager {
  constructor() {
    this.setupStatus = {
      isComplete: false,
      components: {
        database: { status: SETUP_STATUS.PENDING, retryCount: 0 },
        categories: { status: SETUP_STATUS.PENDING, retryCount: 0 },
        structure: { status: SETUP_STATUS.PENDING, retryCount: 0 }
      },
      progress: 0,
      errors: []
    };
    
    this.setupPromise = null;
    this.listeners = new Set();
  }

  /**
   * Ensures the system is ready, initializing in background if needed
   */
  async ensureSystemReady() {
    if (this.setupStatus.isComplete) {
      return this.setupStatus;
    }

    if (!this.setupPromise) {
      this.setupPromise = this.initializeInBackground();
    }

    try {
      await this.setupPromise;
    } catch (error) {
      console.warn('Setup failed, but continuing with fallback data:', error);
    }

    return this.setupStatus;
  }

  /**
   * Performs background initialization of all system components
   */
  async initializeInBackground() {
    console.log('Starting background system initialization...');
    
    try {
      // Check database connection
      await this.initializeComponent('database', async () => {
        const testRef = collection(db, 'categories');
        await getDocs(testRef);
      });

      // Setup Firebase structure
      await this.initializeComponent('structure', async () => {
        await setupFirebaseStructure();
      });

      // Initialize categories
      await this.initializeComponent('categories', async () => {
        await initializeCategories();
      });

      this.setupStatus.isComplete = true;
      this.setupStatus.progress = 100;
      console.log('Background setup completed successfully');
      
    } catch (error) {
      console.error('Background setup failed:', error);
      this.setupStatus.errors.push({
        message: error.message,
        timestamp: new Date(),
        component: 'general'
      });
    }

    this.notifyListeners();
    return this.setupStatus;
  }

  /**
   * Initialize a specific component with retry logic
   */
  async initializeComponent(componentName, initFunction) {
    const component = this.setupStatus.components[componentName];
    const config = RETRY_CONFIG[componentName];
    
    component.status = SETUP_STATUS.INITIALIZING;
    this.notifyListeners();

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        await initFunction();
        component.status = SETUP_STATUS.READY;
        component.lastAttempt = new Date();
        this.updateProgress();
        this.notifyListeners();
        return;
        
      } catch (error) {
        component.retryCount = attempt + 1;
        component.lastAttempt = new Date();
        
        if (attempt === config.maxRetries) {
          component.status = SETUP_STATUS.ERROR;
          this.setupStatus.errors.push({
            message: `${componentName}: ${error.message}`,
            timestamp: new Date(),
            component: componentName
          });
          throw error;
        }

        // Wait before retry with exponential backoff
        const delay = config.baseDelay * Math.pow(2, attempt);
        console.log(`${componentName} setup failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Update overall progress based on component status
   */
  updateProgress() {
    const components = Object.values(this.setupStatus.components);
    const readyCount = components.filter(c => c.status === SETUP_STATUS.READY).length;
    this.setupStatus.progress = Math.round((readyCount / components.length) * 100);
  }

  /**
   * Get current setup progress
   */
  getSetupProgress() {
    return {
      progress: this.setupStatus.progress,
      isComplete: this.setupStatus.isComplete,
      components: { ...this.setupStatus.components },
      errors: [...this.setupStatus.errors]
    };
  }

  /**
   * Subscribe to setup progress updates
   */
  onSetupProgress(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of setup progress changes
   */
  notifyListeners() {
    const progress = this.getSetupProgress();
    this.listeners.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('Error in setup progress listener:', error);
      }
    });
  }

  /**
   * Check if a specific component is ready
   */
  isComponentReady(componentName) {
    return this.setupStatus.components[componentName]?.status === SETUP_STATUS.READY;
  }

  /**
   * Reset setup status (for testing or manual retry)
   */
  reset() {
    this.setupStatus = {
      isComplete: false,
      components: {
        database: { status: SETUP_STATUS.PENDING, retryCount: 0 },
        categories: { status: SETUP_STATUS.PENDING, retryCount: 0 },
        structure: { status: SETUP_STATUS.PENDING, retryCount: 0 }
      },
      progress: 0,
      errors: []
    };
    this.setupPromise = null;
  }
}

// Create singleton instance
export const autoSetupManager = new AutoSetupManager();

// Convenience function for components
export async function ensureSystemReady() {
  return await autoSetupManager.ensureSystemReady();
}

export default AutoSetupManager;