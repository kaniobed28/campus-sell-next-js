"use client";
import React, { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import ResponsiveAdminTable from '@/components/admin/ResponsiveAdminTable';
import ResponsiveAdminModal from '@/components/admin/ResponsiveAdminModal';
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
      <ResponsiveAdminTable
        data={users}
        columns={[
          {
            key: 'main',
            label: 'User',
            render: (_, user) => (
              <div className="flex items-center">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {user.displayName || 'No Name'}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            )
          },
          {
            key: 'status',
            label: 'Status',
            render: (_, user) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status || USER_STATUS.ACTIVE)}`}>
                {(user.status || USER_STATUS.ACTIVE).toUpperCase()}
              </span>
            )
          },
          {
            key: 'date',
            label: 'Registration',
            render: (_, user) => formatDate(user.registrationDate)
          },
          {
            key: 'lastLogin',
            label: 'Last Login',
            render: (_, user) => formatDate(user.lastLogin)
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (_, user) => (
              <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => openUserModal(user)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  View Details
                </button>
                {user.status === USER_STATUS.SUSPENDED && (
                  <button
                    onClick={() => handleUserAction('activate', user.uid)}
                    className="text-green-600 hover:text-green-900 text-sm font-medium"
                  >
                    Activate
                  </button>
                )}
                {(user.status === USER_STATUS.ACTIVE || !user.status) && (
                  <button
                    onClick={() => handleUserAction('suspend', user.uid, 'Admin action')}
                    className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                  >
                    Suspend
                  </button>
                )}
                {user.status !== USER_STATUS.BANNED && (
                  <button
                    onClick={() => handleUserAction('ban', user.uid, 'Admin action')}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Ban
                  </button>
                )}
              </div>
            )
          }
        ]}
        loading={loading}
        onRowClick={openUserModal}
        onRowSelect={handleUserSelect}
        selectedRows={selectedUsers}
        showSelection={true}
        emptyMessage="No users found matching the current filters."
      />

      {/* User Details Modal */}
      <ResponsiveAdminModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="lg"
        actions={
          <button
            onClick={() => setShowUserModal(false)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Close
          </button>
        }
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedUser.displayName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status || USER_STATUS.ACTIVE)}`}>
                  {(selectedUser.status || USER_STATUS.ACTIVE).toUpperCase()}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{formatDate(selectedUser.registrationDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{formatDate(selectedUser.lastLogin)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <p className="text-sm text-gray-900 font-mono p-2 bg-gray-50 rounded break-all">{selectedUser.uid}</p>
              </div>
            </div>
            
            {selectedUser.suspensionReason && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suspension Reason</label>
                <p className="text-sm text-gray-900 p-3 bg-yellow-50 border border-yellow-200 rounded">{selectedUser.suspensionReason}</p>
              </div>
            )}
            
            {selectedUser.banReason && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ban Reason</label>
                <p className="text-sm text-gray-900 p-3 bg-red-50 border border-red-200 rounded">{selectedUser.banReason}</p>
              </div>
            )}

            {/* Action buttons for mobile */}
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 pt-4 border-t">
              {selectedUser.status === USER_STATUS.SUSPENDED && (
                <button
                  onClick={() => {
                    handleUserAction('activate', selectedUser.uid);
                    setShowUserModal(false);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Activate User
                </button>
              )}
              {(selectedUser.status === USER_STATUS.ACTIVE || !selectedUser.status) && (
                <button
                  onClick={() => {
                    handleUserAction('suspend', selectedUser.uid, 'Admin action');
                    setShowUserModal(false);
                  }}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  Suspend User
                </button>
              )}
              {selectedUser.status !== USER_STATUS.BANNED && (
                <button
                  onClick={() => {
                    handleUserAction('ban', selectedUser.uid, 'Admin action');
                    setShowUserModal(false);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Ban User
                </button>
              )}
            </div>
          </div>
        )}
      </ResponsiveAdminModal>
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




