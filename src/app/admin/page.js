"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { adminSessionManager } from '@/lib/adminSessionManager';
import { auditLogService } from '@/services/auditLogService';
import { ADMIN_ROLES } from '@/types/admin';

const AdminDashboardContent = () => {
  const router = useRouter();
  const { user, adminData, loading, signOut } = useAdminAuth();
  const { logSystemAction } = useAuditLog();
  const [recentLogs, setRecentLogs] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Start admin session when component mounts
    if (adminData && adminData.email) {
      try {
        adminSessionManager.startSession(adminData.email);
        
        // Log dashboard access
        logSystemAction('dashboard_accessed', {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
        
        // Load recent activity
        loadRecentActivity();
      } catch (error) {
        console.error('Error initializing admin dashboard:', error);
      }
    }

    // Cleanup session when component unmounts
    return () => {
      try {
        adminSessionManager.endSession();
      } catch (error) {
        console.error('Error ending admin session:', error);
      }
    };
  }, [adminData, logSystemAction]);

  const loadRecentActivity = async () => {
    try {
      const logs = await auditLogService.getRecentLogs(5);
      setRecentLogs(logs);
      
      const auditStats = await auditLogService.getAuditStats();
      setStats(auditStats);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    }
  };

  const handleSessionExtend = () => {
    console.log('Session extended');
  };

  const handleSessionTimeout = async () => {
    console.log('Session timed out, signing out...');
    await signOut();
    router.push('/auth');
  };

  // Show loading state while admin data is being fetched
  if (loading || !adminData) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Admin dashboard
  return (
    <AdminLayout title="Admin Dashboard">
      <div className="mb-4">
        <p className="text-muted-foreground">Campus Marketplace Administration</p>
      </div>
        {/* Welcome Section */}
        {adminData && (
          <div className="bg-card rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Welcome, {adminData.email}!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Role</h3>
                <p className="text-blue-700 dark:text-blue-300 capitalize">{adminData.role}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-100">Status</h3>
                <p className="text-green-700 dark:text-green-300">{adminData.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900 dark:text-purple-100">Permissions</h3>
                <p className="text-purple-700 dark:text-purple-300">{adminData.permissions?.length || 0} permissions</p>
              </div>
            </div>
          </div>
        )}

        {/* Permissions List */}
        {adminData && adminData.permissions && (
          <div className="bg-card rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Your Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {adminData.permissions.map((permission) => (
                <div key={permission} className="bg-muted px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-foreground">
                    {permission.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-card rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${adminData?.role === ADMIN_ROLES.PRINCIPAL ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4`}>
            <a
              href="/admin/init-system"
              className="bg-primary text-primary-foreground p-4 rounded-lg hover:opacity-90 text-center transition-opacity"
            >
              <h4 className="font-medium">System Setup</h4>
              <p className="text-sm opacity-90">Initialize admin system</p>
            </a>
            <a
              href="/admin/init-categories"
              className="bg-secondary text-secondary-foreground p-4 rounded-lg hover:opacity-90 text-center transition-opacity"
            >
              <h4 className="font-medium">Categories</h4>
              <p className="text-sm opacity-90">Manage categories</p>
            </a>
            <a
              href="/admin/users"
              className="bg-accent text-accent-foreground p-4 rounded-lg hover:opacity-90 text-center transition-opacity"
            >
              <h4 className="font-medium">Users</h4>
              <p className="text-sm opacity-90">Manage user accounts</p>
            </a>
            <a
              href="/admin/products"
              className="bg-muted text-muted-foreground hover:bg-muted/80 p-4 rounded-lg text-center transition-colors"
            >
              <h4 className="font-medium">Products</h4>
              <p className="text-sm opacity-90">Moderate product listings</p>
            </a>
            {adminData?.role === ADMIN_ROLES.PRINCIPAL && (
              <a
                href="/admin/admins"
                className="bg-destructive text-destructive-foreground p-4 rounded-lg hover:opacity-90 text-center transition-opacity"
              >
                <h4 className="font-medium">Admin Management</h4>
                <p className="text-sm opacity-90">Manage admin accounts</p>
              </a>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Admin Activity</h3>
            <a 
              href="/admin/audit-logs" 
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              View All Logs →
            </a>
          </div>
          
          {recentLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {log.action?.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.adminEmail} • {log.targetType}: {log.targetId}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Statistics */}
        {stats && (
          <div className="bg-card rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">System Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                <h4 className="font-medium text-primary">Total Audit Logs</h4>
                <p className="text-2xl font-bold text-primary">{stats.totalLogs}</p>
              </div>
              <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-lg">
                <h4 className="font-medium text-secondary-foreground">Active Admins</h4>
                <p className="text-2xl font-bold text-secondary-foreground">{stats.uniqueAdmins}</p>
              </div>
              <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg">
                <h4 className="font-medium text-accent-foreground">Actions Today</h4>
                <p className="text-2xl font-bold text-accent-foreground">{stats.recentActivity.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Development Info */}
        <div className="mt-8 bg-muted border border-border rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-2">Development Status</h4>
          <p className="text-sm text-muted-foreground">
            Admin authentication, session management, and audit logging are now implemented. 
            Additional features will be added in subsequent tasks.
          </p>
        </div>
    </AdminLayout>
  );
};

const AdminDashboard = () => {
  return (
    <AdminAuthGuard>
      <AdminDashboardContent />
    </AdminAuthGuard>
  );
};

export default AdminDashboard;