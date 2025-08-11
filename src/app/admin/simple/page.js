"use client";
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { adminAuthService } from '@/services/adminAuthService';

const SimpleAdminDashboard = () => {
  const [user, loading, error] = useAuthState(auth);
  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState(null);

  useEffect(() => {
    checkAdminStatus();
  }, [user, loading]);

  const checkAdminStatus = async () => {
    if (loading) return;
    
    if (!user) {
      setAdminLoading(false);
      return;
    }

    try {
      setAdminLoading(true);
      setAdminError(null);
      
      const admin = await adminAuthService.checkAdminStatus(user.email);
      setAdminData(admin);
      
      if (admin) {
        await adminAuthService.updateLastLogin(user.email);
      }
    } catch (err) {
      console.error('Admin check error:', err);
      setAdminError(err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // Loading state
  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || adminError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="text-gray-600 mb-6">{error?.message || adminError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">
            You need to be signed in with an admin account.
          </p>
          <a 
            href="/auth" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Not an admin
  if (!adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have admin privileges.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Signed in as: {user.email}
          </p>
          <div className="space-y-3">
            <a 
              href="/admin/quick-init" 
              className="block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Initialize Admin (if you're kaniobed28@gmail.com)
            </a>
            <a 
              href="/admin/debug" 
              className="block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Debug Admin Status
            </a>
            <a 
              href="/" 
              className="block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Simple Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Campus Marketplace Administration</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminData.email}</p>
                <p className="text-xs text-gray-500 capitalize">{adminData.role} Admin</p>
              </div>
              <button
                onClick={() => auth.signOut()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
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

        {/* Permissions List */}
        {adminData.permissions && adminData.permissions.length > 0 && (
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
        <div className="bg-white rounded-lg shadow p-6 mb-8">
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
            <a
              href="/admin/audit-logs"
              className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 text-center"
            >
              <h4 className="font-medium">Audit Logs</h4>
              <p className="text-sm opacity-90">View admin activity</p>
            </a>
            <a
              href="/admin/debug"
              className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 text-center"
            >
              <h4 className="font-medium">Debug</h4>
              <p className="text-sm opacity-90">Debug admin system</p>
            </a>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Admin System Working!</h4>
          <p className="text-sm text-green-700">
            You have successfully accessed the admin dashboard. The admin system is now functional.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SimpleAdminDashboard;