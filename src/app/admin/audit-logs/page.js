"use client";
import React, { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { auditLogService } from '@/services/auditLogService';
import { ADMIN_PERMISSIONS, AUDIT_ACTION_TYPES } from '@/types/admin';

const AuditLogsContent = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    adminEmail: '',
    action: '',
    targetType: '',
    limit: 50
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadAuditLogs();
    loadAuditStats();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const auditLogs = await auditLogService.getAuditLogs(filters);
      setLogs(auditLogs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditStats = async () => {
    try {
      const auditStats = await auditLogService.getAuditStats();
      setStats(auditStats);
    } catch (err) {
      console.error('Failed to load audit stats:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    loadAuditLogs();
  };

  const clearFilters = () => {
    setFilters({
      adminEmail: '',
      action: '',
      targetType: '',
      limit: 50
    });
    setTimeout(loadAuditLogs, 100);
  };

  const exportLogs = async () => {
    try {
      const csvContent = await auditLogService.exportLogs(filters);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export logs: ' + err.message);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const formatDetails = (details) => {
    if (!details || Object.keys(details).length === 0) return 'N/A';
    return JSON.stringify(details, null, 2);
  };

  const getActionColor = (action) => {
    const colors = {
      [AUDIT_ACTION_TYPES.USER_SUSPENDED]: 'text-red-600',
      [AUDIT_ACTION_TYPES.USER_BANNED]: 'text-red-800',
      [AUDIT_ACTION_TYPES.USER_ACTIVATED]: 'text-green-600',
      [AUDIT_ACTION_TYPES.PRODUCT_BLOCKED]: 'text-orange-600',
      [AUDIT_ACTION_TYPES.PRODUCT_REMOVED]: 'text-red-600',
      [AUDIT_ACTION_TYPES.PRODUCT_RESTORED]: 'text-green-600',
      [AUDIT_ACTION_TYPES.ADMIN_CREATED]: 'text-blue-600',
      [AUDIT_ACTION_TYPES.ADMIN_UPDATED]: 'text-blue-500',
      [AUDIT_ACTION_TYPES.ADMIN_REMOVED]: 'text-red-600',
      [AUDIT_ACTION_TYPES.SETTINGS_UPDATED]: 'text-purple-600'
    };
    return colors[action] || 'text-gray-600';
  };

  const breadcrumbs = [
    { label: 'Audit Logs' }
  ];

  if (loading) {
    return (
      <AdminLayout title="Audit Logs" breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading audit logs...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Audit Logs" breadcrumbs={breadcrumbs}>
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Logs</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Admins</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.uniqueAdmins}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Most Common Action</h3>
            <p className="text-sm font-bold text-gray-900">
              {Object.keys(stats.actionCounts).length > 0 
                ? Object.entries(stats.actionCounts).sort(([,a], [,b]) => b - a)[0][0]
                : 'N/A'
              }
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Recent Activity</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.recentActivity.length}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={filters.adminEmail}
              onChange={(e) => handleFilterChange('adminEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Filter by admin email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Actions</option>
              {Object.values(AUDIT_ACTION_TYPES).map(action => (
                <option key={action} value={action}>
                  {action.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Type
            </label>
            <select
              value={filters.targetType}
              onChange={(e) => handleFilterChange('targetType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Types</option>
              <option value="user">User</option>
              <option value="product">Product</option>
              <option value="category">Category</option>
              <option value="admin">Admin</option>
              <option value="setting">Setting</option>
              <option value="system">System</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limit
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={25}>25 logs</option>
              <option value={50}>50 logs</option>
              <option value={100}>100 logs</option>
              <option value={200}>200 logs</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={applyFilters}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Clear Filters
          </button>
          <button
            onClick={exportLogs}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Audit Logs ({logs.length})</h3>
        </div>
        
        {logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No audit logs found matching the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.adminEmail}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getActionColor(log.action)}`}>
                      {log.action?.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <span className="font-medium">{log.targetType}</span>
                        <br />
                        <span className="text-gray-500 text-xs">{log.targetId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800">
                          View Details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded max-w-xs overflow-auto">
                          {formatDetails(log.details)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const AuditLogsPage = () => {
  return (
    <AdminAuthGuard requiredPermission={ADMIN_PERMISSIONS.AUDIT_LOGS}>
      <AuditLogsContent />
    </AdminAuthGuard>
  );
};

export default AuditLogsPage;
