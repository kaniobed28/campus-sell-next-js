// scripts/initializeAdminSystem.js
import { adminAuthService } from '@/services/adminAuthService';

/**
 * Initialize the admin system
 * This script sets up the principal admin and basic admin infrastructure
 */
export async function initializeAdminSystem() {
  try {
    console.log('Initializing admin system...');
    
    // Initialize principal admin
    const principalAdmin = await adminAuthService.initializePrincipalAdmin();
    console.log('Principal admin initialized:', principalAdmin.email);
    
    console.log('Admin system initialization completed successfully');
    return {
      success: true,
      principalAdmin
    };
  } catch (error) {
    console.error('Failed to initialize admin system:', error);
    throw new Error(`Admin system initialization failed: ${error.message}`);
  }
}

/**
 * Reset admin system (for development/testing)
 */
export async function resetAdminSystem() {
  try {
    console.log('Resetting admin system...');
    
    // Re-initialize principal admin
    const principalAdmin = await adminAuthService.initializePrincipalAdmin();
    
    console.log('Admin system reset completed successfully');
    return {
      success: true,
      principalAdmin
    };
  } catch (error) {
    console.error('Failed to reset admin system:', error);
    throw new Error(`Admin system reset failed: ${error.message}`);
  }
}

/**
 * Verify admin system setup
 */
export async function verifyAdminSystem() {
  try {
    console.log('Verifying admin system...');
    
    // Check if principal admin exists
    const principalAdmin = await adminAuthService.getPrincipalAdmin();
    
    if (!principalAdmin) {
      throw new Error('Principal admin not found');
    }
    
    if (!principalAdmin.isActive) {
      throw new Error('Principal admin is not active');
    }
    
    console.log('Admin system verification completed successfully');
    return {
      success: true,
      principalAdmin,
      status: 'verified'
    };
  } catch (error) {
    console.error('Admin system verification failed:', error);
    return {
      success: false,
      error: error.message,
      status: 'failed'
    };
  }
}