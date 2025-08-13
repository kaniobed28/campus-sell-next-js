// services/adminAuthService.js
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

// Admin roles
export const ADMIN_ROLES = {
  PRINCIPAL: 'principal',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

// Admin permissions
export const ADMIN_PERMISSIONS = {
  USER_MANAGEMENT: 'user_management',
  PRODUCT_MODERATION: 'product_moderation',
  CATEGORY_MANAGEMENT: 'category_management',
  DELIVERY_MANAGEMENT: 'delivery_management',
  ANALYTICS_VIEW: 'analytics_view',
  PLATFORM_SETTINGS: 'platform_settings',
  ADMIN_MANAGEMENT: 'admin_management',
  AUDIT_LOGS: 'audit_logs'
};

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.PRINCIPAL]: Object.values(ADMIN_PERMISSIONS),
  [ADMIN_ROLES.ADMIN]: [
    ADMIN_PERMISSIONS.USER_MANAGEMENT,
    ADMIN_PERMISSIONS.PRODUCT_MODERATION,
    ADMIN_PERMISSIONS.CATEGORY_MANAGEMENT,
    ADMIN_PERMISSIONS.DELIVERY_MANAGEMENT,
    ADMIN_PERMISSIONS.ANALYTICS_VIEW,
    ADMIN_PERMISSIONS.AUDIT_LOGS
  ],
  [ADMIN_ROLES.MODERATOR]: [
    ADMIN_PERMISSIONS.PRODUCT_MODERATION,
    ADMIN_PERMISSIONS.ANALYTICS_VIEW
  ]
};

class AdminAuthService {
  constructor() {
    this.adminsCollection = collection(db, 'admins');
  }

  /**
   * Initialize the principal admin
   */
  async initializePrincipalAdmin() {
    try {
      const principalEmail = 'kaniobed28@gmail.com';
      const principalAdminDoc = doc(this.adminsCollection, principalEmail);
      
      // Check if principal admin already exists
      const existingAdmin = await getDoc(principalAdminDoc);
      
      if (!existingAdmin.exists()) {
        // Create new principal admin
        const principalAdminData = {
          email: principalEmail,
          role: ADMIN_ROLES.PRINCIPAL,
          permissions: ROLE_PERMISSIONS[ADMIN_ROLES.PRINCIPAL],
          createdAt: serverTimestamp(),
          createdBy: 'system',
          isActive: true,
          lastLogin: null
        };

        await setDoc(principalAdminDoc, principalAdminData);
        console.log('Principal admin initialized successfully');
        return principalAdminData;
      } else {
        // Update existing principal admin permissions to ensure they're current
        const currentData = existingAdmin.data();
        const updatedData = {
          ...currentData,
          permissions: ROLE_PERMISSIONS[ADMIN_ROLES.PRINCIPAL],
          updatedAt: serverTimestamp(),
          updatedBy: 'system'
        };

        await updateDoc(principalAdminDoc, {
          permissions: ROLE_PERMISSIONS[ADMIN_ROLES.PRINCIPAL],
          updatedAt: serverTimestamp(),
          updatedBy: 'system'
        });

        console.log('Principal admin permissions updated successfully');
        return updatedData;
      }
    } catch (error) {
      console.error('Error initializing principal admin:', error);
      throw new Error('Failed to initialize principal admin');
    }
  }

  /**
   * Check if a user is an admin
   */
  async checkAdminStatus(email) {
    try {
      if (!email) return null;
      
      const adminDoc = doc(this.adminsCollection, email);
      const adminSnapshot = await getDoc(adminDoc);
      
      if (adminSnapshot.exists()) {
        const adminData = adminSnapshot.data();
        return adminData.isActive ? adminData : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking admin status:', error);
      throw new Error('Failed to check admin status');
    }
  }

  /**
   * Get admin by email
   */
  async getAdmin(email) {
    try {
      console.log('Getting admin with email:', email);
      const adminDoc = doc(this.adminsCollection, email);
      const adminSnapshot = await getDoc(adminDoc);
      
      console.log('Admin document exists:', adminSnapshot.exists());
      
      if (adminSnapshot.exists()) {
        const adminData = { email: adminSnapshot.id, ...adminSnapshot.data() };
        console.log('Admin data found:', adminData);
        return adminData;
      }
      
      console.log('Admin not found for email:', email);
      return null;
    } catch (error) {
      console.error('Error getting admin:', error);
      throw new Error('Failed to get admin');
    }
  }

  /**
   * Get all admins
   */
  async getAllAdmins() {
    try {
      const adminsSnapshot = await getDocs(this.adminsCollection);
      const admins = adminsSnapshot.docs.map(doc => ({
        email: doc.id, // Document ID is the email
        ...doc.data()
      }));
      
      // Remove any potential duplicates based on email
      const uniqueAdmins = admins.reduce((acc, admin) => {
        if (!acc.find(existing => existing.email === admin.email)) {
          acc.push(admin);
        }
        return acc;
      }, []);
      
      return uniqueAdmins;
    } catch (error) {
      console.error('Error getting all admins:', error);
      throw new Error('Failed to get admins');
    }
  }

  /**
   * Create a new admin account
   */
  async createAdmin(email, role, createdBy) {
    try {
      // Validate role
      if (!Object.values(ADMIN_ROLES).includes(role)) {
        throw new Error('Invalid admin role');
      }

      // Check if admin already exists
      const existingAdmin = await this.getAdmin(email);
      if (existingAdmin) {
        throw new Error('Admin already exists');
      }

      const adminData = {
        email,
        role,
        permissions: ROLE_PERMISSIONS[role] || [],
        createdAt: serverTimestamp(),
        createdBy,
        isActive: true,
        lastLogin: null
      };

      const adminDoc = doc(this.adminsCollection, email);
      await setDoc(adminDoc, adminData);

      return { id: email, ...adminData };
    } catch (error) {
      console.error('Error creating admin:', error);
      throw new Error(`Failed to create admin: ${error.message}`);
    }
  }

  /**
   * Update admin role and permissions
   */
  async updateAdminRole(email, newRole, updatedBy) {
    try {
      // Validate role
      if (!Object.values(ADMIN_ROLES).includes(newRole)) {
        throw new Error('Invalid admin role');
      }

      const adminDoc = doc(this.adminsCollection, email);
      
      // Check if document exists before trying to update
      const adminSnapshot = await getDoc(adminDoc);
      if (!adminSnapshot.exists()) {
        throw new Error(`Admin document not found: ${email}`);
      }

      const updateData = {
        role: newRole,
        permissions: ROLE_PERMISSIONS[newRole] || [],
        updatedAt: serverTimestamp(),
        updatedBy
      };

      await updateDoc(adminDoc, updateData);
      
      return await this.getAdmin(email);
    } catch (error) {
      console.error('Error updating admin role:', error);
      throw new Error(`Failed to update admin role: ${error.message}`);
    }
  }

  /**
   * Remove admin privileges
   */
  async removeAdmin(email, removedBy) {
    try {
      console.log('Removing admin from Firestore:', email);
      
      // Prevent removal of principal admin
      if (email === 'kaniobed28@gmail.com') {
        throw new Error('Cannot remove principal admin');
      }

      const adminDoc = doc(this.adminsCollection, email);
      console.log('Admin document reference created for:', email);
      
      // Check if document exists before trying to delete
      const adminSnapshot = await getDoc(adminDoc);
      if (!adminSnapshot.exists()) {
        console.log('Admin document does not exist, considering it already deleted:', email);
        return true; // Consider it successful if already doesn't exist
      }
      
      await deleteDoc(adminDoc);
      console.log('Admin document deleted successfully:', email);

      return true;
    } catch (error) {
      console.error('Error removing admin:', error);
      throw new Error(`Failed to remove admin: ${error.message}`);
    }
  }

  /**
   * Suspend admin account
   */
  async suspendAdmin(email, suspendedBy, reason) {
    try {
      // Prevent suspension of principal admin
      if (email === 'kaniobed28@gmail.com') {
        throw new Error('Cannot suspend principal admin');
      }

      const adminDoc = doc(this.adminsCollection, email);
      
      // Check if document exists before trying to update
      const adminSnapshot = await getDoc(adminDoc);
      if (!adminSnapshot.exists()) {
        throw new Error(`Admin document not found: ${email}`);
      }

      const updateData = {
        isActive: false,
        suspendedAt: serverTimestamp(),
        suspendedBy,
        suspensionReason: reason,
        updatedAt: serverTimestamp()
      };

      await updateDoc(adminDoc, updateData);
      
      return await this.getAdmin(email);
    } catch (error) {
      console.error('Error suspending admin:', error);
      throw new Error(`Failed to suspend admin: ${error.message}`);
    }
  }

  /**
   * Reactivate admin account
   */
  async reactivateAdmin(email, reactivatedBy) {
    try {
      const adminDoc = doc(this.adminsCollection, email);
      
      // Check if document exists before trying to update
      const adminSnapshot = await getDoc(adminDoc);
      if (!adminSnapshot.exists()) {
        throw new Error(`Admin document not found: ${email}`);
      }

      const updateData = {
        isActive: true,
        suspendedAt: null,
        suspendedBy: null,
        suspensionReason: null,
        reactivatedAt: serverTimestamp(),
        reactivatedBy,
        updatedAt: serverTimestamp()
      };

      await updateDoc(adminDoc, updateData);
      
      return await this.getAdmin(email);
    } catch (error) {
      console.error('Error reactivating admin:', error);
      throw new Error(`Failed to reactivate admin: ${error.message}`);
    }
  }

  /**
   * Update admin last login
   */
  async updateLastLogin(email) {
    try {
      const adminDoc = doc(this.adminsCollection, email);
      await updateDoc(adminDoc, {
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error for login tracking failures
    }
  }

  /**
   * Check if admin has specific permission
   */
  hasPermission(adminData, permission) {
    if (!adminData || !adminData.permissions) return false;
    return adminData.permissions.includes(permission);
  }

  /**
   * Check if admin has any of the specified permissions
   */
  hasAnyPermission(adminData, permissions) {
    if (!adminData || !adminData.permissions) return false;
    return permissions.some(permission => adminData.permissions.includes(permission));
  }

  /**
   * Get principal admin
   */
  async getPrincipalAdmin() {
    try {
      return await this.getAdmin('kaniobed28@gmail.com');
    } catch (error) {
      console.error('Error getting principal admin:', error);
      throw new Error('Failed to get principal admin');
    }
  }
}

// Export singleton instance
export const adminAuthService = new AdminAuthService();
export default adminAuthService;