"use client";
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { adminAuthService } from '@/services/adminAuthService';
import { ADMIN_PERMISSIONS } from '@/types/admin';

const AdminAuthGuard = ({ 
  children, 
  requiredPermission = null, 
  requiredPermissions = [], 
  fallback = null,
  redirectTo = '/auth'
}) => {
  const [user, loading, error] = useAuthState(auth);
  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (user && user.email) {
        try {
          setAdminLoading(true);
          const admin = await adminAuthService.checkAdminStatus(user.email);
          setAdminData(admin);
          
          if (admin) {
            // Update last login
            await adminAuthService.updateLastLogin(user.email);
          }
        } catch (err) {
          console.error('Admin auth check failed:', err);
          setAdminError(err.message);
        } finally {
          setAdminLoading(false);
        }
      } else {
        setAdminLoading(false);
      }
    };

    if (!loading) {
      checkAdminAccess();
    }
  }, [user, loading]);

  // Check if admin has required permissions
  const hasRequiredPermissions = () => {
    if (!adminData || !adminData.permissions) return false;
    
    // Check single required permission
    if (requiredPermission) {
      return adminData.permissions.includes(requiredPermission);
    }
    
    // Check multiple required permissions (all must be present)
    if (requiredPermissions.length > 0) {
      return requiredPermissions.every(permission => 
        adminData.permissions.includes(permission)
      );
    }
    
    // No specific permissions required, just need to be admin
    return true;
  };

  // Loading state
  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Authentication error
  if (error || adminError) {
    const errorMessage = error?.message || adminError;
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h1>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in with an admin account to access this area.
          </p>
          <a 
            href={redirectTo} 
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Not an admin
  if (!adminData) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges. Contact the system administrator if you believe this is an error.
          </p>
          <div className="text-sm text-muted-foreground mb-4">
            <p>Signed in as: {user.email}</p>
          </div>
          <a 
            href="/" 
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // Insufficient permissions
  if (!hasRequiredPermissions()) {
    if (fallback) {
      return fallback;
    }
    
    const missingPermissions = requiredPermissions.length > 0 
      ? requiredPermissions.filter(p => !adminData.permissions.includes(p))
      : [requiredPermission].filter(Boolean);
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Insufficient Permissions</h1>
          <p className="text-muted-foreground mb-4">
            You don't have the required permissions to access this area.
          </p>
          {missingPermissions.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-red-800 mb-2">Required permissions:</p>
              <ul className="text-sm text-red-700">
                {missingPermissions.map(permission => (
                  <li key={permission} className="capitalize">
                    • {permission.replace('_', ' ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-sm text-muted-foreground mb-4">
            <p>Signed in as: {user.email} ({adminData.role})</p>
          </div>
          <a 
            href="/admin" 
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Return to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return children;
};

export default AdminAuthGuard;