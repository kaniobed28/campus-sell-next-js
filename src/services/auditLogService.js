// services/auditLogService.js
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  startAfter,
  endBefore
} from 'firebase/firestore';
import { AUDIT_ACTION_TYPES } from '@/types/admin';
import { convertTimestamp } from '@/utils/timestampUtils';

class AuditLogService {
  constructor() {
    this.auditLogsCollection = collection(db, 'audit_logs');
  }

  /**
   * Log an admin action
   */
  async logAction(adminEmail, action, targetType, targetId, details = {}, ipAddress = null) {
    try {
      // Filter out undefined values from details
      const cleanDetails = {};
      Object.keys(details).forEach(key => {
        if (details[key] !== undefined && details[key] !== null) {
          cleanDetails[key] = details[key];
        }
      });

      const logEntry = {
        adminEmail,
        action,
        targetType,
        targetId,
        details: cleanDetails,
        timestamp: serverTimestamp(),
        ipAddress: ipAddress || this.getClientIP(),
        userAgent: this.getUserAgent()
      };

      const docRef = await addDoc(this.auditLogsCollection, logEntry);
      
      console.log('Audit log created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Failed to log admin action:', error);
      throw new Error('Failed to create audit log');
    }
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(filters = {}) {
    try {
      let q = query(this.auditLogsCollection);

      // Apply filters
      if (filters.adminEmail) {
        q = query(q, where('adminEmail', '==', filters.adminEmail));
      }

      if (filters.action) {
        q = query(q, where('action', '==', filters.action));
      }

      if (filters.targetType) {
        q = query(q, where('targetType', '==', filters.targetType));
      }

      if (filters.targetId) {
        q = query(q, where('targetId', '==', filters.targetId));
      }

      if (filters.startDate) {
        q = query(q, where('timestamp', '>=', filters.startDate));
      }

      if (filters.endDate) {
        q = query(q, where('timestamp', '<=', filters.endDate));
      }

      // Order by timestamp (most recent first)
      q = query(q, orderBy('timestamp', 'desc'));

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
          id: doc.id,
          ...data,
          timestamp: convertTimestamp(data.timestamp)
        };
      });
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      throw new Error('Failed to retrieve audit logs');
    }
  }

  /**
   * Get recent audit logs for dashboard
   */
  async getRecentLogs(limitCount = 10) {
    try {
      const q = query(
        this.auditLogsCollection,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: convertTimestamp(data.timestamp)
        };
      });
    } catch (error) {
      console.error('Failed to get recent audit logs:', error);
      throw new Error('Failed to retrieve recent audit logs');
    }
  }

  /**
   * Get audit logs for specific admin
   */
  async getAdminLogs(adminEmail, limitCount = 50) {
    try {
      const q = query(
        this.auditLogsCollection,
        where('adminEmail', '==', adminEmail),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: convertTimestamp(data.timestamp)
        };
      });
    } catch (error) {
      console.error('Failed to get admin logs:', error);
      throw new Error('Failed to retrieve admin logs');
    }
  }

  /**
   * Get audit logs for specific target
   */
  async getTargetLogs(targetType, targetId, limitCount = 20) {
    try {
      const q = query(
        this.auditLogsCollection,
        where('targetType', '==', targetType),
        where('targetId', '==', targetId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: convertTimestamp(data.timestamp)
        };
      });
    } catch (error) {
      console.error('Failed to get target logs:', error);
      throw new Error('Failed to retrieve target logs');
    }
  }

  /**
   * Export audit logs to CSV
   */
  async exportLogs(filters = {}) {
    try {
      const logs = await this.getAuditLogs(filters);
      
      const csvHeaders = [
        'Timestamp',
        'Admin Email',
        'Action',
        'Target Type',
        'Target ID',
        'Details',
        'IP Address',
        'User Agent'
      ];

      const csvRows = logs.map(log => [
        log.timestamp ? log.timestamp.toISOString() : '',
        log.adminEmail || '',
        log.action || '',
        log.targetType || '',
        log.targetId || '',
        JSON.stringify(log.details || {}),
        log.ipAddress || '',
        log.userAgent || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      throw new Error('Failed to export audit logs');
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(dateRange = null) {
    try {
      let q = query(this.auditLogsCollection);

      if (dateRange && dateRange.start) {
        q = query(q, where('timestamp', '>=', dateRange.start));
      }

      if (dateRange && dateRange.end) {
        q = query(q, where('timestamp', '<=', dateRange.end));
      }

      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => doc.data());

      // Calculate statistics
      const stats = {
        totalLogs: logs.length,
        uniqueAdmins: new Set(logs.map(log => log.adminEmail)).size,
        actionCounts: {},
        targetTypeCounts: {},
        adminActivityCounts: {},
        recentActivity: logs
          .sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0))
          .slice(0, 10)
      };

      // Count actions
      logs.forEach(log => {
        stats.actionCounts[log.action] = (stats.actionCounts[log.action] || 0) + 1;
        stats.targetTypeCounts[log.targetType] = (stats.targetTypeCounts[log.targetType] || 0) + 1;
        stats.adminActivityCounts[log.adminEmail] = (stats.adminActivityCounts[log.adminEmail] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get audit statistics:', error);
      throw new Error('Failed to retrieve audit statistics');
    }
  }

  /**
   * Helper methods
   */
  getClientIP() {
    // This would typically be handled server-side
    // For client-side, we can't reliably get the real IP
    return 'client-side';
  }

  getUserAgent() {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
  }

  /**
   * Predefined logging methods for common actions
   */
  async logUserAction(adminEmail, action, userId, details = {}) {
    return this.logAction(adminEmail, action, 'user', userId, details);
  }

  async logProductAction(adminEmail, action, productId, details = {}) {
    return this.logAction(adminEmail, action, 'product', productId, details);
  }

  async logCategoryAction(adminEmail, action, categoryId, details = {}) {
    return this.logAction(adminEmail, action, 'category', categoryId, details);
  }

  async logAdminAction(adminEmail, action, targetAdminEmail, details = {}) {
    return this.logAction(adminEmail, action, 'admin', targetAdminEmail, details);
  }

  async logSettingsAction(adminEmail, action, settingKey, details = {}) {
    return this.logAction(adminEmail, action, 'setting', settingKey, details);
  }

  async logSystemAction(adminEmail, action, details = {}) {
    return this.logAction(adminEmail, action, 'system', 'system', details);
  }

  async logDeliveryCompanyAction(adminEmail, action, companyId, details = {}) {
    return this.logAction(adminEmail, action, 'delivery_company', companyId, details);
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService();
export default auditLogService;