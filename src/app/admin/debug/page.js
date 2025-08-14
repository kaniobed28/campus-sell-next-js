"use client";
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { adminAuthService } from '@/services/adminAuthService';

const AdminDebugPage = () => {
  const [user, loading, error] = useAuthState(auth);
  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user || !user.email) return;
    
    try {
      setAdminLoading(true);
      console.log('Checking admin status for:', user.email);
      
      const admin = await adminAuthService.checkAdminStatus(user.email);
      console.log('Admin data received:', admin);
      
      setAdminData(admin);
      setDebugInfo({
        userEmail: user.email,
        userUID: user.uid,
        adminFound: !!admin,
        adminData: admin,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error checking admin status:', err);
      setDebugInfo({
        userEmail: user.email,
        userUID: user.uid,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setAdminLoading(false);
    }
  };

  const initializePrincipalAdmin = async () => {
    try {
      setAdminLoading(true);
      console.log('Initializing principal admin...');
      
      const result = await adminAuthService.initializePrincipalAdmin();
      console.log('Principal admin initialized:', result);
      
      // Recheck admin status
      await checkAdminStatus();
    } catch (err) {
      console.error('Failed to initialize principal admin:', err);
      setDebugInfo(prev => ({
        ...prev,
        initError: err.message
      }));
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Admin Debug Page</h1>
        <p className="text-gray-600">Debug admin authentication issues</p>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">User Authentication</h2>
        {loading ? (
          <p>Loading user data...</p>
        ) : error ? (
          <p className="text-red-600">Auth Error: {error.message}</p>
        ) : user ? (
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>UID:</strong> {user.uid}</p>
            <p><strong>Display Name:</strong> {user.displayName || 'N/A'}</p>
            <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
            <p><strong>Provider:</strong> {user.providerData?.[0]?.providerId || 'N/A'}</p>
          </div>
        ) : (
          <p className="text-red-600">Not authenticated</p>
        )}
      </div>

      {/* Admin Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Admin Status</h2>
        {adminLoading ? (
          <p>Checking admin status...</p>
        ) : (
          <div className="space-y-2">
            <p><strong>Is Admin:</strong> {adminData ? 'Yes' : 'No'}</p>
            {adminData && (
              <>
                <p><strong>Role:</strong> {adminData.role}</p>
                <p><strong>Active:</strong> {adminData.isActive ? 'Yes' : 'No'}</p>
                <p><strong>Permissions:</strong> {adminData.permissions?.join(', ') || 'None'}</p>
                <p><strong>Created At:</strong> {adminData.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}</p>
              </>
            )}
          </div>
        )}
        
        <div className="mt-4">
          <button
            onClick={checkAdminStatus}
            disabled={adminLoading || !user}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mr-3"
          >
            Recheck Admin Status
          </button>
          
          <button
            onClick={initializePrincipalAdmin}
            disabled={adminLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Initialize Principal Admin
          </button>
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 text-center space-x-4">
        <a 
          href="/admin/init-system" 
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
        >
          Go to Init System
        </a>
        <a 
          href="/admin" 
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          Try Admin Dashboard
        </a>
      </div>
    </div>
  );
};

export default AdminDebugPage;



