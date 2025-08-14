"use client";
import React from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import { ADMIN_PERMISSIONS } from '@/types/admin';

const DebugPermissionsPage = () => {
  const { adminData, loading } = useAdminAuth();

  if (loading) {
    return (
      <AdminLayout title="Debug Permissions">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Debug Permissions">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Admin Data</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-900">{adminData?.email || 'Not available'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="text-sm text-gray-900">{adminData?.role || 'Not available'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Is Active</label>
              <p className="text-sm text-gray-900">{adminData?.isActive ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Permissions</h2>
          <div className="space-y-2">
            {adminData?.permissions ? (
              adminData.permissions.map((permission, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    ✓ {permission}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No permissions found</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Expected Permissions</h2>
          <div className="space-y-2">
            {Object.values(ADMIN_PERMISSIONS).map((permission, index) => {
              const hasPermission = adminData?.permissions?.includes(permission);
              return (
                <div key={index} className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    hasPermission 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {hasPermission ? '✓' : '✗'} {permission}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Permission Check Results</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Has DELIVERY_MANAGEMENT</label>
              <p className={`text-sm font-medium ${
                adminData?.permissions?.includes(ADMIN_PERMISSIONS.DELIVERY_MANAGEMENT) 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {adminData?.permissions?.includes(ADMIN_PERMISSIONS.DELIVERY_MANAGEMENT) ? 'YES' : 'NO'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Fix Instructions</h3>
          <p className="text-sm text-yellow-700 mb-4">
            If you're missing the DELIVERY_MANAGEMENT permission, go to the Admin System Initialization page and click "Initialize Admin System" to update your permissions.
          </p>
          <a 
            href="/admin/init-system" 
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm font-medium"
          >
            Go to System Initialization
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Raw Admin Data</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
            {JSON.stringify(adminData, null, 2)}
          </pre>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DebugPermissionsPage;

