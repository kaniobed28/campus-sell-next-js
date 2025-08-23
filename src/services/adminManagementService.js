// services/adminManagementService.js
import { adminAuthService } from './adminAuthService';
import { auditLogService } from './auditLogService';
import { ADMIN_ROLES, ADMIN_PERMISSIONS, ROLE_PERMISSIONS } from '@/types/admin';

class AdminManagementService {
  constructor() {
    this.adminAuthService = adminAuthService;
    this.auditLogService = auditLogService;
  }

  /**
   * Get all admins with detailed information
   */
  async getAllAdmins() {
    try {
      const admins = await this.adminAuthService.getAllAdmins();
      
      // Remove duplicates based on email
      const uniqueAdmins = admins.reduce((acc, admin) => {
        if (!acc.find(existing => existing.email === admin.email)) {
          acc.push(admin);
        }
        return acc;
      }, []);
      
      // Verify each admin actually exists in Firestore and clean up phantom entries
      const verifiedAdmins = [];
      for (const admin of uniqueAdmins) {
        try {
          const verifiedAdmin = await this.adminAuthService.getAdmin(admin.email);
          if (verifiedAdmin) {
            verifiedAdmins.push(verifiedAdmin);
          } else {
            console.warn(`Phantom admin entry found and skipped: ${admin.email}`);
          }
        } catch (error) {
          console.warn(`Error verifying admin ${admin.email}, skipping:`, error.message);
        }
      }
      
      // Add additional computed fields
      return verifiedAdmins.map((admin, index) => ({
        ...admin,
        uniqueId: `${admin.email}-${index}`, // Add unique ID for React keys
        roleDisplayName: this.getRoleDisplayName(admin.role),
        permissionCount: admin.permissions?.length || 0,
        canBeDeleted: admin.email !== 'kaniobed28@gmail.com', // Principal admin cannot be deleted
        canBeModified: admin.email !== 'kaniobed28@gmail.com' // Principal admin cannot be modified
      }));
    } catch (error) {
      console.error('Failed to get all admins:', error);
      throw new Error('Failed to retrieve admin list');
    }
  }

  /**
   * Create a new admin account
   */
  async createAdmin(adminData, createdBy) {
    try {
      const { email, role, customPermissions } = adminData;
      
      // Validate input
      if (!email || !role) {
        throw new Error('Email and role are required');
      }

      if (!Object.values(ADMIN_ROLES).includes(role)) {
        throw new Error('Invalid admin role');
      }

      // Check if admin already exists
      const existingAdmin = await this.adminAuthService.getAdmin(email);
      if (existingAdmin) {
        throw new Error('Admin with this email already exists');
      }

      // Determine permissions
      let permissions = ROLE_PERMISSIONS[role] || [];
      if (customPermissions && Array.isArray(customPermissions)) {
        // Use custom permissions if provided (for advanced admin management)
        permissions = customPermissions.filter(p => 
          Object.values(ADMIN_PERMISSIONS).includes(p)
        );
      }

      // Create admin
      const newAdmin = await this.adminAuthService.createAdmin(email, role, createdBy);
      
      // Update permissions if custom ones were provided
      if (customPermissions && Array.isArray(customPermissions)) {
        await this.updateAdminPermissions(email, customPermissions, createdBy);
      }

      // Log the action
      const logDetails = {
        role: role || 'unknown',
        permissions: permissions ? permissions.length : 0
      };
      
      await this.auditLogService.logAdminAction(
        createdBy,
        'admin_created',
        email,
        logDetails
      );

      return newAdmin;
    } catch (error) {
      console.error('Failed to create admin:', error);
      throw new Error(`Failed to create admin: ${error.message}`);
    }
  }

  /**
   * Update admin role and permissions
   */
  async updateAdmin(email, updateData, updatedBy) {
    try {
      // Prevent modification of principal admin
      if (email === 'kaniobed28@gmail.com') {
        throw new Error('Cannot modify principal admin');
      }

      const { role, customPermissions } = updateData;
      let updatedAdmin;

      // Update role if provided
      if (role && Object.values(ADMIN_ROLES).includes(role)) {
        updatedAdmin = await this.adminAuthService.updateAdminRole(email, role, updatedBy);
      }

      // Update custom permissions if provided
      if (customPermissions && Array.isArray(customPermissions)) {
        updatedAdmin = await this.updateAdminPermissions(email, customPermissions, updatedBy);
      }

      // Log the action
      const logDetails = {};
      if (role) {
        logDetails.role = role;
      }
      if (customPermissions !== undefined) {
        logDetails.customPermissions = !!customPermissions;
      }
      
      await this.auditLogService.logAdminAction(
        updatedBy,
        'admin_updated',
        email,
        logDetails
      );

      return updatedAdmin || await this.adminAuthService.getAdmin(email);
    } catch (error) {
      console.error('Failed to update admin:', error);
      throw new Error(`Failed to update admin: ${error.message}`);
    }
  }

  /**
   * Update admin permissions (custom permissions)
   */
  async updateAdminPermissions(email, permissions, updatedBy) {
    try {
      // Validate permissions
      const validPermissions = permissions.filter(p => 
        Object.values(ADMIN_PERMISSIONS).includes(p)
      );

      if (validPermissions.length !== permissions.length) {
        throw new Error('Some permissions are invalid');
      }

      // Update admin with custom permissions
      const admin = await this.adminAuthService.getAdmin(email);
      if (!admin) {
        throw new Error('Admin not found');
      }

      // Use the updateAdminRole method but preserve the role
      const updatedAdmin = await this.adminAuthService.updateAdminRole(email, admin.role, updatedBy);
      
      // Manually update permissions (this would need to be added to AdminAuthService)
      // For now, we'll use the role-based permissions
      
      return updatedAdmin;
    } catch (error) {
      console.error('Failed to update admin permissions:', error);
      throw new Error(`Failed to update admin permissions: ${error.message}`);
    }
  }

  /**
   * Delete admin account
   */
  async deleteAdmin(email, deletedBy) {
    try {
      console.log('Attempting to delete admin:', email);
      
      // Prevent deletion of principal admin
      if (email === 'kaniobed28@gmail.com') {
        throw new Error('Cannot delete principal admin');
      }

      // Check if admin exists
      let admin = await this.adminAuthService.getAdmin(email);
      console.log('Admin found for deletion:', admin);
      
      if (!admin) {
        // Try to get all admins to see what's available
        const allAdmins = await this.adminAuthService.getAllAdmins();
        console.log('All available admins:', allAdmins.map(a => a.email));
        
        // Check if the admin exists in the list but getAdmin failed
        admin = allAdmins.find(a => a.email === email);
        if (!admin) {
          throw new Error(`Admin not found: ${email}. Available admins: ${allAdmins.map(a => a.email).join(', ')}`);
        }
        console.log('Found admin in list:', admin);
      }

      // Delete admin - try the deletion even if we couldn't find it in the check
      try {
        await this.adminAuthService.removeAdmin(email, deletedBy);
      } catch (deleteError) {
        console.error('Error during admin deletion:', deleteError);
        throw new Error(`Failed to delete admin from database: ${deleteError.message}`);
      }

      // Log the action
      try {
        const logDetails = {};
        if (admin && admin.role) {
          logDetails.role = admin.role;
        }
        if (admin && admin.permissions) {
          logDetails.permissionCount = admin.permissions.length;
        }
        
        await this.auditLogService.logAdminAction(
          deletedBy,
          'admin_removed',
          email,
          logDetails
        );
      } catch (logError) {
        console.warn('Failed to log admin deletion:', logError);
        // Don't fail the deletion if logging fails
      }

      return { success: true, deletedAdmin: admin };
    } catch (error) {
      console.error('Failed to delete admin:', error);
      throw new Error(`Failed to delete admin: ${error.message}`);
    }
  }

  /**
   * Suspend admin account
   */
  async suspendAdmin(email, reason, suspendedBy) {
    try {
      // Prevent suspension of principal admin
      if (email === 'kaniobed28@gmail.com') {
        throw new Error('Cannot suspend principal admin');
      }

      const suspendedAdmin = await this.adminAuthService.suspendAdmin(email, suspendedBy, reason);

      // Log the action
      const logDetails = {};
      if (reason) {
        logDetails.reason = reason;
      }
      
      await this.auditLogService.logAdminAction(
        suspendedBy,
        'admin_suspended',
        email,
        logDetails
      );

      return suspendedAdmin;
    } catch (error) {
      console.error('Failed to suspend admin:', error);
      throw new Error(`Failed to suspend admin: ${error.message}`);
    }
  }

  /**
   * Reactivate admin account
   */
  async reactivateAdmin(email, reactivatedBy) {
    try {
      const reactivatedAdmin = await this.adminAuthService.reactivateAdmin(email, reactivatedBy);

      // Log the action
      await this.auditLogService.logAdminAction(
        reactivatedBy,
        'admin_reactivated',
        email,
        {}
      );

      return reactivatedAdmin;
    } catch (error) {
      console.error('Failed to reactivate admin:', error);
      throw new Error(`Failed to reactivate admin: ${error.message}`);
    }
  }

  /**
   * Get admin statistics
   */
  async getAdminStats() {
    try {
      const admins = await this.getAllAdmins();
      
      const stats = {
        totalAdmins: admins.length,
        activeAdmins: admins.filter(admin => admin.isActive).length,
        suspendedAdmins: admins.filter(admin => !admin.isActive).length,
        principalAdmins: admins.filter(admin => admin.role === ADMIN_ROLES.PRINCIPAL).length,
        regularAdmins: admins.filter(admin => admin.role === ADMIN_ROLES.ADMIN).length,
        moderators: admins.filter(admin => admin.role === ADMIN_ROLES.MODERATOR).length,
        roleDistribution: {},
        recentAdmins: admins.filter(admin => {
          if (!admin.createdAt) return false;
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(admin.createdAt) > weekAgo;
        }).length
      };

      // Calculate role distribution
      admins.forEach(admin => {
        stats.roleDistribution[admin.role] = (stats.roleDistribution[admin.role] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get admin statistics:', error);
      throw new Error('Failed to retrieve admin statistics');
    }
  }

  /**
   * Get available roles and their permissions
   */
  getRolesAndPermissions() {
    return {
      roles: Object.values(ADMIN_ROLES).map(role => ({
        value: role,
        label: this.getRoleDisplayName(role),
        permissions: ROLE_PERMISSIONS[role] || [],
        description: this.getRoleDescription(role)
      })),
      permissions: Object.values(ADMIN_PERMISSIONS).map(permission => ({
        value: permission,
        label: this.getPermissionDisplayName(permission),
        description: this.getPermissionDescription(permission)
      }))
    };
  }

  /**
   * Validate admin creation data
   */
  validateAdminData(adminData) {
    const errors = [];
    
    if (!adminData.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminData.email)) {
      errors.push('Invalid email format');
    }

    if (!adminData.role) {
      errors.push('Role is required');
    } else if (!Object.values(ADMIN_ROLES).includes(adminData.role)) {
      errors.push('Invalid role selected');
    }

    if (adminData.customPermissions) {
      const invalidPermissions = adminData.customPermissions.filter(p => 
        !Object.values(ADMIN_PERMISSIONS).includes(p)
      );
      if (invalidPermissions.length > 0) {
        errors.push(`Invalid permissions: ${invalidPermissions.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper methods for display names and descriptions
   */
  getRoleDisplayName(role) {
    const roleNames = {
      [ADMIN_ROLES.PRINCIPAL]: 'Principal Admin',
      [ADMIN_ROLES.ADMIN]: 'Admin',
      [ADMIN_ROLES.MODERATOR]: 'Moderator'
    };
    return roleNames[role] || role;
  }

  getRoleDescription(role) {
    const descriptions = {
      [ADMIN_ROLES.PRINCIPAL]: 'Full system access with ability to manage other admins',
      [ADMIN_ROLES.ADMIN]: 'Comprehensive admin access for user and product management',
      [ADMIN_ROLES.MODERATOR]: 'Limited access focused on content moderation'
    };
    return descriptions[role] || '';
  }

  getPermissionDisplayName(permission) {
    return permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getPermissionDescription(permission) {
    const descriptions = {
      [ADMIN_PERMISSIONS.USER_MANAGEMENT]: 'Manage user accounts, suspend and ban users',
      [ADMIN_PERMISSIONS.PRODUCT_MODERATION]: 'Moderate product listings, block and remove content',
      [ADMIN_PERMISSIONS.CATEGORY_MANAGEMENT]: 'Manage product categories and organization',
      [ADMIN_PERMISSIONS.ANALYTICS_VIEW]: 'View platform analytics and reports',
      [ADMIN_PERMISSIONS.PLATFORM_SETTINGS]: 'Configure platform settings and policies',
      [ADMIN_PERMISSIONS.ADMIN_MANAGEMENT]: 'Manage other admin accounts and permissions',
      [ADMIN_PERMISSIONS.AUDIT_LOGS]: 'View and export admin activity logs'
    };
    return descriptions[permission] || '';
  }
}

// Export singleton instance
export const adminManagementService = new AdminManagementService();
export default adminManagementService;