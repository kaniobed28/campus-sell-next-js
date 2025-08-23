import { useCallback } from 'react';
import { useAdminAuth } from './useAdminAuth';
import { auditLogService } from '@/services/auditLogService';
import { AUDIT_ACTION_TYPES } from '@/types/admin';

/**
 * Hook for audit logging with admin context
 */
export const useAuditLog = () => {
  const { adminData } = useAdminAuth();

  const logAction = useCallback(async (action, targetType, targetId, details = {}) => {
    if (!adminData || !adminData.email) {
      console.warn('Cannot log action: No admin context');
      return null;
    }

    try {
      return await auditLogService.logAction(
        adminData.email,
        action,
        targetType,
        targetId,
        details
      );
    } catch (error) {
      console.error('Failed to log audit action:', error);
      return null;
    }
  }, [adminData]);

  // Convenience methods for common actions
  const logUserAction = useCallback(async (action, userId, details = {}) => {
    return logAction(action, 'user', userId, details);
  }, [logAction]);

  const logProductAction = useCallback(async (action, productId, details = {}) => {
    return logAction(action, 'product', productId, details);
  }, [logAction]);

  const logCategoryAction = useCallback(async (action, categoryId, details = {}) => {
    return logAction(action, 'category', categoryId, details);
  }, [logAction]);

  const logAdminAction = useCallback(async (action, targetAdminEmail, details = {}) => {
    return logAction(action, 'admin', targetAdminEmail, details);
  }, [logAction]);

  const logSettingsAction = useCallback(async (action, settingKey, details = {}) => {
    return logAction(action, 'setting', settingKey, details);
  }, [logAction]);

  const logSystemAction = useCallback(async (action, details = {}) => {
    return logAction(action, 'system', 'system', details);
  }, [logAction]);

  return {
    logAction,
    logUserAction,
    logProductAction,
    logCategoryAction,
    logAdminAction,
    logSettingsAction,
    logSystemAction,
    adminEmail: adminData?.email || null
  };
};

export default useAuditLog;