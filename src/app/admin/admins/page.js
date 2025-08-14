"use client";
import React, { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import ResponsiveAdminTable from '@/components/admin/ResponsiveAdminTable';
import ResponsiveAdminModal from '@/components/admin/ResponsiveAdminModal';
import ResponsiveAdminForm from '@/components/admin/ResponsiveAdminForm';
import { adminManagementService } from '@/services/adminManagementService';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { ADMIN_PERMISSIONS, ADMIN_ROLES } from '@/types/admin';

const AdminManagementContent = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [rolesAndPermissions, setRolesAndPermissions] = useState(null);
  
  const { adminData } = useAdminAuth();
  const { logAdminAction } = useAuditLog();

  // Form state for creating/editing admins
  const [formData, setFormData] = useState({
    email: '',
    role: ADMIN_ROLES.MODERATOR,
    customPermissions: [],
    useCustomPermissions: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [adminsList, adminStats, rolesPerms] = await Promise.all([
        adminManagementService.getAllAdmins(),
        adminManagementService.getAdminStats(),
        Promise.resolve(adminManagementService.getRolesAndPermissions())
      ]);
      
      // Debug: Check for duplicates and log admin data
      console.log('Loaded admins:', adminsList);
      const emails = adminsList.map(admin => admin.email);
      const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
      if (duplicates.length > 0) {
        console.warn('Duplicate admin emails found:', duplicates);
        // Filter out duplicates as a safety measure
        const uniqueAdmins = adminsList.filter((admin, index, self) => 
          index === self.findIndex(a => a.email === admin.email)
        );
        setAdmins(uniqueAdmins);
      } else {
        setAdmins(adminsList);
      }
      setStats(adminStats);
      setRolesAndPermissions(rolesPerms);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate form data
      const validation = adminManagementService.validateAdminData(formData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      // Create admin
      await adminManagementService.createAdmin(formData, adminData.email);
      
      // Log action
      await logAdminAction('admin_created', formData.email, {
        role: formData.role,
        customPermissions: formData.useCustomPermissions
      });
      
      // Reset form and close modal
      setFormData({
        email: '',
        role: ADMIN_ROLES.MODERATOR,
        customPermissions: [],
        useCustomPermissions: false
      });
      setShowCreateModal(false);
      
      // Reload data
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await adminManagementService.updateAdmin(
        selectedAdmin.email,
        {
          role: formData.role,
          customPermissions: formData.useCustomPermissions ? formData.customPermissions : null
        },
        adminData.email
      );
      
      // Log action
      await logAdminAction('admin_updated', selectedAdmin.email, {
        role: formData.role,
        customPermissions: formData.useCustomPermissions
      });
      
      setShowEditModal(false);
      setSelectedAdmin(null);
      
      // Reload data
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      setLoading(true);
      
      await adminManagementService.deleteAdmin(selectedAdmin.email, adminData.email);
      
      // Log action
      await logAdminAction('admin_removed', selectedAdmin.email, {
        role: selectedAdmin.role
      });
      
      setShowDeleteModal(false);
      setSelectedAdmin(null);
      
      // Reload data
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendAdmin = async (admin) => {
    try {
      setLoading(true);
      
      if (admin.isActive) {
        await adminManagementService.suspendAdmin(admin.email, 'Admin action', adminData.email);
      } else {
        await adminManagementService.reactivateAdmin(admin.email, adminData.email);
      }
      
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      email: '',
      role: ADMIN_ROLES.MODERATOR,
      customPermissions: [],
      useCustomPermissions: false
    });
    setShowCreateModal(true);
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      email: admin.email,
      role: admin.role,
      customPermissions: admin.permissions || [],
      useCustomPermissions: false
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      customPermissions: prev.customPermissions.includes(permission)
        ? prev.customPermissions.filter(p => p !== permission)
        : [...prev.customPermissions, permission]
    }));
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const breadcrumbs = [
    { label: 'Admin Management' }
  ];

  // Check if current user is principal admin
  const isPrincipalAdmin = adminData && adminData.role === ADMIN_ROLES.PRINCIPAL;

  if (!isPrincipalAdmin) {
    return (
      <AdminLayout title="Admin Management" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only the Principal Admin can access admin management.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Management" breadcrumbs={breadcrumbs}>
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Admins</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Admins</h3>
            <p className="text-2xl font-bold text-green-600">{stats.activeAdmins}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Regular Admins</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.regularAdmins}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Moderators</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.moderators}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Admin Accounts</h3>
          <button
            onClick={openCreateModal}
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            Add New Admin
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Admins Table */}
      <ResponsiveAdminTable
        data={admins}
        columns={[
          {
            key: 'main',
            label: 'Admin',
            render: (_, admin) => (
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {admin.email}
                </div>
                {admin.email === 'kaniobed28@gmail.com' && (
                  <div className="text-xs text-blue-600 font-medium">Principal Admin</div>
                )}
              </div>
            )
          },
          {
            key: 'role',
            label: 'Role',
            render: (_, admin) => (
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {admin.roleDisplayName}
              </span>
            )
          },
          {
            key: 'status',
            label: 'Status',
            render: (_, admin) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(admin.isActive)}`}>
                {admin.isActive ? 'Active' : 'Suspended'}
              </span>
            )
          },
          {
            key: 'permissions',
            label: 'Permissions',
            render: (_, admin) => `${admin.permissionCount} permissions`
          },
          {
            key: 'date',
            label: 'Created',
            render: (_, admin) => formatDate(admin.createdAt)
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (_, admin) => (
              <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-2">
                {admin.canBeModified && (
                  <>
                    <button
                      onClick={() => openEditModal(admin)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleSuspendAdmin(admin)}
                      className={`text-sm font-medium ${admin.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                    >
                      {admin.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </>
                )}
                {admin.canBeDeleted && (
                  <button
                    onClick={() => openDeleteModal(admin)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
                {!admin.canBeModified && !admin.canBeDeleted && (
                  <span className="text-gray-400 text-sm">Protected</span>
                )}
              </div>
            )
          }
        ]}
        loading={loading}
        emptyMessage="No admin accounts found."
      />

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Admin</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {rolesAndPermissions?.roles.filter(role => role.value !== ADMIN_ROLES.PRINCIPAL).map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.useCustomPermissions}
                    onChange={(e) => handleFormChange('useCustomPermissions', e.target.checked)}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Use custom permissions</span>
                </label>
              </div>

              {formData.useCustomPermissions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Permissions
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {rolesAndPermissions?.permissions.map(permission => (
                      <label key={permission.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.customPermissions.includes(permission.value)}
                          onChange={() => handlePermissionToggle(permission.value)}
                          className="rounded border-gray-300 mr-2"
                        />
                        <span className="text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Admin: {selectedAdmin.email}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {rolesAndPermissions?.roles.filter(role => role.value !== ADMIN_ROLES.PRINCIPAL).map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.useCustomPermissions}
                    onChange={(e) => handleFormChange('useCustomPermissions', e.target.checked)}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Use custom permissions</span>
                </label>
              </div>

              {formData.useCustomPermissions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Permissions
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {rolesAndPermissions?.permissions.map(permission => (
                      <label key={permission.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.customPermissions.includes(permission.value)}
                          onChange={() => handlePermissionToggle(permission.value)}
                          className="rounded border-gray-300 mr-2"
                        />
                        <span className="text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Admin Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Delete Admin</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete the admin account for{' '}
                <strong>{selectedAdmin.email}</strong>?
              </p>
              <p className="text-red-600 text-sm mt-2">
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAdmin}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const AdminManagementPage = () => {
  return (
    <AdminAuthGuard requiredPermission={ADMIN_PERMISSIONS.ADMIN_MANAGEMENT}>
      <AdminManagementContent />
    </AdminAuthGuard>
  );
};

export default AdminManagementPage;

