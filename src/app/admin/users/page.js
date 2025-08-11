"use client";
import React, { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { userManagementService } from '@/services/userManagementService';
import { useAuditLog } from '@/hooks/useAuditLog';
import { ADMIN_PERMISSIONS, USER_STATUS, AUDIT_ACTION_TYPES } from '@/types/admin';

const UserManagementContent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    limit: 50
  });

  const { logUserAction } = useAuditLog();

  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let users;
      if (filters.search && filters.search.trim().length >= 2) {
        users = await userManagementService.searchUsers(filters.search, filters.limit);
      } else {
        users = await userManagementService.getAllUsers(filters);
      }
      
      setUsers(users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const userStats = await userManagementService.getUserStats();
      setStats(userStats);
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    loadUsers();
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      limit: 50
    });
    setTimeout(loadUsers, 100);
  };

  const handleUserSelect = (userId, checked) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.uid));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleUserAction = async (action, userId, reason = '') => {
    try {
      setLoading(true);
      let result;
      
      switch (action) {
        case 'suspend':
          result = await userManagementService.suspendUser(userId, reason, 'current-admin');
          await logUserAction(AUDIT_ACTION_TYPES.USER_SUSPENDED, userId, { reason });
          break;
        case 'activate':
          result = await userManagementService.activateUser(userId, 'current-admin');
          await logUserAction(AUDIT_ACTION_TYPES.USER_ACTIVATED, userId, {});
          break;
        case 'ban':
          result = await userManagementService.banUser(userId, reason, 'current-admin');
          await logUserAction(AUDIT_ACTION_TYPES.USER_BANNED, userId, { reason });
          break;
        default:
          throw new Error('Invalid action');
      }
      
      // Refresh users list
      await loadUsers();
      await loadUserStats();
      
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action, reason = '') => {
    if (selectedUsers.length === 0) return;
    
    try {
      setLoading(true);
      
      await userManagementService.bulkUpdateUserStatus(
        selectedUsers,
        action === 'suspend' ? USER_STATUS.SUSPENDED : 
        action === 'activate' ? USER_STATUS.ACTIVE : USER_STATUS.BANNED,
        reason,
        'current-admin'
      );
      
      // Log bulk action
      await logUserAction(`bulk_${action}`, 'multiple', { 
        userCount: selectedUsers.length, 
        reason 
      });
      
      setSelectedUsers([]);
      await loadUsers();
      await loadUserStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case USER_STATUS.ACTIVE:
        return 'text-green-600 bg-green-100';
      case USER_STATUS.SUSPENDED:
        return 'text-yellow-600 bg-yellow-100';
      case USER_STATUS.BANNED:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const breadcrumbs = [
    { label: 'User Management' }
  ];

  return (
    <AdminLayout title="User Management" breadcrumbs={breadcrumbs}>
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Suspended</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.suspendedUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Banned</h3>
            <p className="text-2xl font-bold text-red-600">{stats.bannedUsers}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters & Search</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search by email or name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value={USER_STATUS.ACTIVE}>Active</option>
              <option value={USER_STATUS.SUSPENDED}>Suspended</option>
              <option value={USER_STATUS.BANNED}>Banned</option>
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
              <option value={25}>25 users</option>
              <option value={50}>50 users</option>
              <option value={100}>100 users</option>
              <option value={200}>200 users</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={applyFilters}
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Activate Selected
              </button>
              <button
                onClick={() => handleBulkAction('suspend', 'Bulk suspension')}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
              >
                Suspend Selected
              </button>
              <button
                onClick={() => handleBulkAction('ban', 'Bulk ban')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Ban Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Users ({users.length})</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No users found matching the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.uid)}
                        onChange={(e) => handleUserSelect(user.uid, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status || USER_STATUS.ACTIVE)}`}>
                        {(user.status || USER_STATUS.ACTIVE).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.registrationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openUserModal(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View Details
                      </button>
                      {user.status === USER_STATUS.SUSPENDED && (
                        <button
                          onClick={() => handleUserAction('activate', user.uid)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Activate
                        </button>
                      )}
                      {(user.status === USER_STATUS.ACTIVE || !user.status) && (
                        <button
                          onClick={() => handleUserAction('suspend', user.uid, 'Admin action')}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          Suspend
                        </button>
                      )}
                      {user.status !== USER_STATUS.BANNED && (
                        <button
                          onClick={() => handleUserAction('ban', user.uid, 'Admin action')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">User Details</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Name</label>
                  <p className="text-sm text-gray-900">{selectedUser.displayName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status || USER_STATUS.ACTIVE)}`}>
                    {(selectedUser.status || USER_STATUS.ACTIVE).toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedUser.registrationDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Login</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedUser.lastLogin)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedUser.uid}</p>
                </div>
              </div>
              
              {selectedUser.suspensionReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Suspension Reason</label>
                  <p className="text-sm text-gray-900">{selectedUser.suspensionReason}</p>
                </div>
              )}
              
              {selectedUser.banReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ban Reason</label>
                  <p className="text-sm text-gray-900">{selectedUser.banReason}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const UserManagementPage = () => {
  return (
    <AdminAuthGuard requiredPermission={ADMIN_PERMISSIONS.USER_MANAGEMENT}>
      <UserManagementContent />
    </AdminAuthGuard>
  );
};

export default UserManagementPage;