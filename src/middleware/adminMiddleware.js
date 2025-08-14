// middleware/adminMiddleware.js
import { adminAuthService } from '@/services/adminAuthService';
import { adminSessionManager } from '@/lib/adminSessionManager';

/**
 * Admin route middleware for server-side protection
 * This would typically be used in Next.js middleware or API routes
 */
export class AdminMiddleware {
  constructor() {
    this.protectedPaths = [
      '/admin',
      '/api/admin'
    ];
  }

  /**
   * Check if path requires admin authentication
   */
  isProtectedPath(pathname) {
    return this.protectedPaths.some(path => 
      pathname.startsWith(path) && pathname !== '/admin/init-system'
    );
  }

  /**
   * Verify admin authentication for API routes
   */
  async verifyAdminAuth(request) {
    try {
      // Extract user info from request (this would depend on your auth setup)
      const authHeader = request.headers.get('authorization');
      const userEmail = this.extractUserEmail(authHeader);
      
      if (!userEmail) {
        return {
          success: false,
          error: 'No authentication provided',
          status: 401
        };
      }

      // Check admin status
      const adminData = await adminAuthService.checkAdminStatus(userEmail);
      
      if (!adminData) {
        return {
          success: false,
          error: 'Admin access required',
          status: 403
        };
      }

      if (!adminData.isActive) {
        return {
          success: false,
          error: 'Admin account is inactive',
          status: 403
        };
      }

      return {
        success: true,
        adminData,
        userEmail
      };
    } catch (error) {
      console.error('Admin auth verification failed:', error);
      return {
        success: false,
        error: 'Authentication verification failed',
        status: 500
      };
    }
  }

  /**
   * Verify admin permissions for specific actions
   */
  async verifyAdminPermissions(userEmail, requiredPermissions) {
    try {
      const adminData = await adminAuthService.checkAdminStatus(userEmail);
      
      if (!adminData || !adminData.isActive) {
        return {
          success: false,
          error: 'Admin access required',
          status: 403
        };
      }

      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      const hasPermissions = permissions.every(permission => 
        adminData.permissions.includes(permission)
      );

      if (!hasPermissions) {
        const missingPermissions = permissions.filter(p => 
          !adminData.permissions.includes(p)
        );
        
        return {
          success: false,
          error: `Missing required permissions: ${missingPermissions.join(', ')}`,
          status: 403,
          missingPermissions
        };
      }

      return {
        success: true,
        adminData
      };
    } catch (error) {
      console.error('Permission verification failed:', error);
      return {
        success: false,
        error: 'Permission verification failed',
        status: 500
      };
    }
  }

  /**
   * Create admin authentication middleware for API routes
   */
  createApiMiddleware(requiredPermissions = []) {
    return async (request) => {
      // Verify admin authentication
      const authResult = await this.verifyAdminAuth(request);
      
      if (!authResult.success) {
        return new Response(
          JSON.stringify({ error: authResult.error }),
          { 
            status: authResult.status,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Check permissions if required
      if (requiredPermissions.length > 0) {
        const permissionResult = await this.verifyAdminPermissions(
          authResult.userEmail, 
          requiredPermissions
        );
        
        if (!permissionResult.success) {
          return new Response(
            JSON.stringify({ 
              error: permissionResult.error,
              missingPermissions: permissionResult.missingPermissions 
            }),
            { 
              status: permissionResult.status,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }

      // Add admin data to request context
      request.adminData = authResult.adminData;
      request.adminEmail = authResult.userEmail;
      
      return null; // Continue to next middleware/handler
    };
  }

  /**
   * Extract user email from authorization header
   * This is a placeholder - implement based on your auth system
   */
  extractUserEmail(authHeader) {
    // This would depend on your authentication system
    // For Firebase, you might verify the ID token here
    // For now, this is a placeholder
    return null;
  }

  /**
   * Log admin action for audit trail
   */
  async logAdminAction(adminEmail, action, details = {}) {
    try {
      // This would integrate with your audit logging system
      console.log('Admin action:', {
        adminEmail,
        action,
        details,
        timestamp: new Date().toISOString()
      });
      
      // TODO: Implement actual audit logging
      // await auditLogService.logAction(adminEmail, action, details);
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }
}

/**
 * Higher-order component for protecting admin pages
 * Note: AdminAuthGuard should be imported where this is used
 */
export const withAdminAuth = (WrappedComponent, requiredPermissions = []) => {
  return function AdminProtectedComponent(props) {
    // This would need AdminAuthGuard to be imported in the consuming component
    // For now, this is a placeholder structure
    return <WrappedComponent {...props} />;
  };
};

/**
 * Hook for admin action logging
 */
export const useAdminActionLogger = () => {
  const logAction = async (action, details = {}) => {
    try {
      const adminMiddleware = new AdminMiddleware();
      // Get current admin email from auth context
      // This would need to be implemented based on your auth setup
      const adminEmail = 'current-admin@example.com'; // Placeholder
      
      await adminMiddleware.logAdminAction(adminEmail, action, details);
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  };

  return { logAction };
};

// Export singleton instance
export const adminMiddleware = new AdminMiddleware();
export default adminMiddleware;