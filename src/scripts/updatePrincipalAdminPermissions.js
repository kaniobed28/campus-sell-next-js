/**
 * Script to update the principal admin's permissions with the latest permission set
 * This should be run when new permissions are added to ensure the principal admin has access
 */

import { adminAuthService } from '../services/adminAuthService.js';

const PRINCIPAL_EMAIL = 'kaniobed28@gmail.com';

async function updatePrincipalAdminPermissions() {
  try {
    console.log('Updating principal admin permissions...');
    
    // Update the principal admin's role (this will refresh permissions)
    await adminAuthService.updateAdminRole(
      PRINCIPAL_EMAIL, 
      'principal', 
      'system'
    );
    
    console.log('✅ Principal admin permissions updated successfully!');
    console.log('The principal admin now has access to all permissions including DELIVERY_MANAGEMENT');
    
  } catch (error) {
    console.error('❌ Failed to update principal admin permissions:', error);
  }
}

// Run the update
updatePrincipalAdminPermissions();