// services/userManagementService.js
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  updateDoc,
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  serverTimestamp
} from 'firebase/firestore';
import { USER_STATUS } from '@/types/admin';
import { convertTimestamp } from '@/utils/timestampUtils';

class UserManagementService {
  constructor() {
    this.usersCollection = collection(db, 'users');
  }

  /**
   * Get all users with filtering and pagination
   */
  async getAllUsers(filters = {}) {
    try {
      let q = query(this.usersCollection);

      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.email) {
        q = query(q, where('email', '>=', filters.email), where('email', '<=', filters.email + '\uf8ff'));
      }

      if (filters.displayName) {
        q = query(q, where('displayName', '>=', filters.displayName), where('displayName', '<=', filters.displayName + '\uf8ff'));
      }

      // Order by registration date (most recent first)
      q = query(q, orderBy('registrationDate', 'desc'));

      // Apply pagination
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      if (filters.startAfter) {
        q = query(q, startAfter(filters.startAfter));
      }

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          ...data,
          registrationDate: convertTimestamp(data.registrationDate),
          lastLogin: convertTimestamp(data.lastLogin),
          suspendedAt: convertTimestamp(data.suspendedAt)
        };
      });
    } catch (error) {
      console.error('Failed to get users:', error);
      throw new Error('Failed to retrieve users');
    }
  }

  /**
   * Get user details by UID
   */
  async getUserDetails(uid) {
    try {
      const userDoc = doc(this.usersCollection, uid);
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        return {
          uid: userSnapshot.id,
          ...userData,
          registrationDate: convertTimestamp(userData.registrationDate),
          lastLogin: convertTimestamp(userData.lastLogin),
          suspendedAt: convertTimestamp(userData.suspendedAt)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get user details:', error);
      throw new Error('Failed to retrieve user details');
    }
  }

  /**
   * Suspend user account
   */
  async suspendUser(uid, reason, suspendedBy) {
    try {
      const userDoc = doc(this.usersCollection, uid);
      
      // Check if user exists
      const userSnapshot = await getDoc(userDoc);
      if (!userSnapshot.exists()) {
        throw new Error('User not found');
      }

      const updateData = {
        status: USER_STATUS.SUSPENDED,
        suspensionReason: reason,
        suspendedBy,
        suspendedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(userDoc, updateData);
      
      return await this.getUserDetails(uid);
    } catch (error) {
      console.error('Failed to suspend user:', error);
      throw new Error(`Failed to suspend user: ${error.message}`);
    }
  }

  /**
   * Activate user account (remove suspension)
   */
  async activateUser(uid, activatedBy) {
    try {
      const userDoc = doc(this.usersCollection, uid);
      
      // Check if user exists
      const userSnapshot = await getDoc(userDoc);
      if (!userSnapshot.exists()) {
        throw new Error('User not found');
      }

      const updateData = {
        status: USER_STATUS.ACTIVE,
        suspensionReason: null,
        suspendedBy: null,
        suspendedAt: null,
        activatedBy,
        activatedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(userDoc, updateData);
      
      return await this.getUserDetails(uid);
    } catch (error) {
      console.error('Failed to activate user:', error);
      throw new Error(`Failed to activate user: ${error.message}`);
    }
  }

  /**
   * Ban user account permanently
   */
  async banUser(uid, reason, bannedBy) {
    try {
      const userDoc = doc(this.usersCollection, uid);
      
      // Check if user exists
      const userSnapshot = await getDoc(userDoc);
      if (!userSnapshot.exists()) {
        throw new Error('User not found');
      }

      const updateData = {
        status: USER_STATUS.BANNED,
        banReason: reason,
        bannedBy,
        bannedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(userDoc, updateData);
      
      return await this.getUserDetails(uid);
    } catch (error) {
      console.error('Failed to ban user:', error);
      throw new Error(`Failed to ban user: ${error.message}`);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const allUsers = await this.getAllUsers({ limit: 1000 }); // Get a large sample
      
      const stats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(user => user.status === USER_STATUS.ACTIVE || !user.status).length,
        suspendedUsers: allUsers.filter(user => user.status === USER_STATUS.SUSPENDED).length,
        bannedUsers: allUsers.filter(user => user.status === USER_STATUS.BANNED).length,
        recentRegistrations: allUsers.filter(user => {
          if (!user.registrationDate) return false;
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return user.registrationDate > weekAgo;
        }).length,
        statusDistribution: {}
      };

      // Calculate status distribution
      allUsers.forEach(user => {
        const status = user.status || USER_STATUS.ACTIVE;
        stats.statusDistribution[status] = (stats.statusDistribution[status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get user statistics:', error);
      throw new Error('Failed to retrieve user statistics');
    }
  }

  /**
   * Search users by email or display name
   */
  async searchUsers(searchTerm, limit = 20) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      const searchTermLower = searchTerm.toLowerCase().trim();
      
      // Search by email
      const emailQuery = query(
        this.usersCollection,
        where('email', '>=', searchTermLower),
        where('email', '<=', searchTermLower + '\uf8ff'),
        limit(limit)
      );

      // Search by display name
      const nameQuery = query(
        this.usersCollection,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        limit(limit)
      );

      const [emailResults, nameResults] = await Promise.all([
        getDocs(emailQuery),
        getDocs(nameQuery)
      ]);

      // Combine and deduplicate results
      const userMap = new Map();
      
      emailResults.docs.forEach(doc => {
        userMap.set(doc.id, {
          uid: doc.id,
          ...doc.data(),
          registrationDate: doc.data().registrationDate?.toDate() || null,
          lastLogin: doc.data().lastLogin?.toDate() || null,
          suspendedAt: doc.data().suspendedAt?.toDate() || null
        });
      });

      nameResults.docs.forEach(doc => {
        if (!userMap.has(doc.id)) {
          userMap.set(doc.id, {
            uid: doc.id,
            ...doc.data(),
            registrationDate: doc.data().registrationDate?.toDate() || null,
            lastLogin: doc.data().lastLogin?.toDate() || null,
            suspendedAt: doc.data().suspendedAt?.toDate() || null
          });
        }
      });

      return Array.from(userMap.values()).slice(0, limit);
    } catch (error) {
      console.error('Failed to search users:', error);
      throw new Error('Failed to search users');
    }
  }

  /**
   * Get users by status
   */
  async getUsersByStatus(status, limit = 50) {
    try {
      return await this.getAllUsers({ status, limit });
    } catch (error) {
      console.error('Failed to get users by status:', error);
      throw new Error('Failed to retrieve users by status');
    }
  }

  /**
   * Bulk update user status
   */
  async bulkUpdateUserStatus(userIds, newStatus, reason, updatedBy) {
    try {
      const updatePromises = userIds.map(async (uid) => {
        const userDoc = doc(this.usersCollection, uid);
        
        const updateData = {
          status: newStatus,
          updatedAt: serverTimestamp(),
          updatedBy
        };

        if (newStatus === USER_STATUS.SUSPENDED) {
          updateData.suspensionReason = reason;
          updateData.suspendedBy = updatedBy;
          updateData.suspendedAt = serverTimestamp();
        } else if (newStatus === USER_STATUS.BANNED) {
          updateData.banReason = reason;
          updateData.bannedBy = updatedBy;
          updateData.bannedAt = serverTimestamp();
        } else if (newStatus === USER_STATUS.ACTIVE) {
          updateData.suspensionReason = null;
          updateData.suspendedBy = null;
          updateData.suspendedAt = null;
          updateData.banReason = null;
          updateData.bannedBy = null;
          updateData.bannedAt = null;
          updateData.activatedBy = updatedBy;
          updateData.activatedAt = serverTimestamp();
        }

        return updateDoc(userDoc, updateData);
      });

      await Promise.all(updatePromises);
      
      return {
        success: true,
        updatedCount: userIds.length
      };
    } catch (error) {
      console.error('Failed to bulk update users:', error);
      throw new Error('Failed to bulk update user status');
    }
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(uid) {
    try {
      // This would typically query other collections like products, orders, etc.
      // For now, we'll return a basic summary
      const user = await this.getUserDetails(uid);
      
      if (!user) {
        throw new Error('User not found');
      }

      // TODO: Implement actual activity queries when product/order collections are available
      const activitySummary = {
        user,
        listingsCount: 0, // TODO: Query products collection
        purchasesCount: 0, // TODO: Query orders collection
        reportCount: 0, // TODO: Query reports collection
        lastActivity: user.lastLogin,
        accountAge: user.registrationDate ? 
          Math.floor((new Date() - user.registrationDate) / (1000 * 60 * 60 * 24)) : 0
      };

      return activitySummary;
    } catch (error) {
      console.error('Failed to get user activity summary:', error);
      throw new Error('Failed to retrieve user activity summary');
    }
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService();
export default userManagementService;