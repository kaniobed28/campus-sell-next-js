"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { adminSessionManager } from '@/lib/adminSessionManager';
import { auditLogService } from '@/services/auditLogService';

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
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Admin dashboard
  return (
    <AdminLayout title="Admin Dashboard">
      <div className="mb-4">
        <p className="text-gray-600">Campus Marketplace Administration</p>
      </div>
        {/* Welcome Section */}
        {adminData && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Welcome, {adminData.email}!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">Role</h3>
                <p className="text-blue-700 capitalize">{adminData.role}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">Status</h3>
                <p className="text-green-700">{adminData.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">Permissions</h3>
                <p className="text-purple-700">{adminData.permissions?.length || 0} permissions</p>
              </div>
            </div>
          </div>
        )}

        {/* Permissions List */}
        {adminData && adminData.permissions && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Your Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {adminData.permissions.map((permission) => (
                <div key={permission} className="bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {permission.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/init-system"
              className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 text-center"
            >
              <h4 className="font-medium">System Setup</h4>
              <p className="text-sm opacity-90">Initialize admin system</p>
            </a>
            <a
              href="/admin/init-categories"
              className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 text-center"
            >
              <h4 className="font-medium">Categories</h4>
              <p className="text-sm opacity-90">Manage categories</p>
            </a>
            <div className="bg-gray-300 text-gray-600 p-4 rounded-lg text-center cursor-not-allowed">
              <h4 className="font-medium">Users</h4>
              <p className="text-sm opacity-90">Coming soon</p>
            </div>
            <div className="bg-gray-300 text-gray-600 p-4 rounded-lg text-center cursor-not-allowed">
              <h4 className="font-medium">Products</h4>
              <p className="text-sm opacity-90">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Admin Activity</h3>
            <a 
              href="/admin/audit-logs" 
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              View All Logs →
            </a>
          </div>
          
          {recentLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {log.action?.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {log.adminEmail} • {log.targetType}: {log.targetId}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Statistics */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">System Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Total Audit Logs</h4>
                <p className="text-2xl font-bold text-blue-700">{stats.totalLogs}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Active Admins</h4>
                <p className="text-2xl font-bold text-green-700">{stats.uniqueAdmins}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">Actions Today</h4>
                <p className="text-2xl font-bold text-purple-700">{stats.recentActivity.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Development Info */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Development Status</h4>
          <p className="text-sm text-yellow-700">
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