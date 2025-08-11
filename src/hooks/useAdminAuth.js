import { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { adminAuthService } from '@/services/adminAuthService';
import { ADMIN_PERMISSIONS, ADMIN_ROLES } from '@/types/admin';

/**
 * Custom hook for managing admin authentication state
 * @returns {Object} Admin authentication state and utilities
 */
export const useAdminAuth = () => {
  const [user, loading, error] = useAuthState(auth);
  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);

  // Check admin status
  const checkAdminStatus = useCallback(async (email) => {
    if (!email) return null;
    
    try {
      const admin = await adminAuthService.checkAdminStatus(email);
      return admin;
    } catch (err) {
      console.error('Failed to check admin status:', err);
      throw err;
    }
  }, []);

  // Refresh admin data
  const refreshAdminData = useCallback(async () => {
    if (user && user.email) {
      try {
        setAdminLoading(true);
        setAdminError(null);
        const admin = await checkAdminStatus(user.email);
        setAdminData(admin);
        
        if (admin) {
          // Update last login
          await adminAuthService.updateLastLogin(user.email);
        }
      } catch (err) {
        setAdminError(err.message);
        setAdminData(null);
      } finally {
        setAdminLoading(false);
      }
    } else {
      setAdminData(null);
      setAdminLoading(false);
    }
  }, [user, checkAdminStatus]);

  // Initial admin status check
  useEffect(() => {
    if (!loading) {
      refreshAdminData();
    }
  }, [loading, refreshAdminData]);

  // Permission checking utilities
  const hasPermission = useCallback((permission) => {
    if (!adminData || !adminData.permissions) return false;
    return adminData.permissions.includes(permission);
  }, [adminData]);

  const hasAnyPermission = useCallback((permissions) => {
    if (!adminData || !adminData.permissions) return false;
    return permissions.some(permission => adminData.permissions.includes(permission));
  }, [adminData]);

  const hasAllPermissions = useCallback((permissions) => {
    if (!adminData || !adminData.permissions) return false;
    return permissions.every(permission => adminData.permissions.includes(permission));
  }, [adminData]);

  // Role checking utilities
  const hasRole = useCallback((role) => {
    return adminData && adminData.role === role;
  }, [adminData]);

  const isPrincipalAdmin = useCallback(() => {
    return adminData && 
           adminData.email === 'kaniobed28@gmail.com' && 
           adminData.role === ADMIN_ROLES.PRINCIPAL;
  }, [adminData]);

  const isAdmin = useCallback(() => {
    return adminData && adminData.isActive;
  }, [adminData]);

  // Computed states
  const isAuthenticated = !!user;
  const isAdminAuthenticated = isAuthenticated && isAdmin();
  const isLoading = loading || adminLoading;
  const authError = error || adminError;

  return {
    // User state
    user,
    isAuthenticated,
    
    // Admin state
    adminData,
    isAdmin: isAdmin(),
    isAdminAuthenticated,
    isPrincipalAdmin: isPrincipalAdmin(),
    adminRole: adminData?.role || null,
    adminPermissions: adminData?.permissions || [],
    
    // Loading and error states
    loading: isLoading,
    adminLoading,
    error: authError,
    adminError,
    
    // Utilities
    checkAdminStatus,
    refreshAdminData,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    
    // Auth actions
    signOut: () => auth.signOut()
  };
};

/**
 * Hook for checking specific admin permissions
 * @param {string|string[]} requiredPermissions - Permission(s) to check
 * @returns {Object} Permission check results
 */
export const useAdminPermissions = (requiredPermissions) => {
  const { adminData, hasPermission, hasAnyPermission, hasAllPermissions, loading } = useAdminAuth();
  
  const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  
  const hasRequired = permissions.length === 1 
    ? hasPermission(permissions[0])
    : hasAllPermissions(permissions);
    
  const hasAnyRequired = hasAnyPermission(permissions);
  
  return {
    hasPermission: hasRequired,
    hasAnyPermission: hasAnyRequired,
    hasAllPermissions: hasAllPermissions(permissions),
    loading,
    adminData
  };
};

/**
 * Hook for admin role checking
 * @param {string|string[]} requiredRoles - Role(s) to check
 * @returns {Object} Role check results
 */
export const useAdminRole = (requiredRoles) => {
  const { adminData, hasRole, loading } = useAdminAuth();
  
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  const hasRequiredRole = roles.some(role => hasRole(role));
  
  return {
    hasRole: hasRequiredRole,
    currentRole: adminData?.role || null,
    loading,
    adminData
  };
};

export default useAdminAuth;