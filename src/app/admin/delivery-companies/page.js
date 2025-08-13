"use client";
import React, { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import ResponsiveAdminTable from '@/components/admin/ResponsiveAdminTable';
import ResponsiveAdminModal from '@/components/admin/ResponsiveAdminModal';
import DeliveryCompanyForm from '@/components/admin/DeliveryCompanyForm';
import { deliveryCompanyService } from '@/services/deliveryCompanyService';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ADMIN_PERMISSIONS } from '@/types/admin';
import { COMPANY_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/types/delivery';

const DeliveryCompaniesContent = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    limit: 50
  });
  const [success, setSuccess] = useState(null);

  const { adminData } = useAdminAuth();

  useEffect(() => {
    loadCompanies();
    loadStats();
  }, [filters]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await deliveryCompanyService.getAllCompanies(filters);
      setCompanies(result.companies);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const companyStats = await deliveryCompanyService.getCompanyStats();
      setStats(companyStats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleCompanySelect = (companyId, checked) => {
    if (checked) {
      setSelectedCompanies(prev => [...prev, companyId]);
    } else {
      setSelectedCompanies(prev => prev.filter(id => id !== companyId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCompanies(companies.map(company => company.id));
    } else {
      setSelectedCompanies([]);
    }
  };

  const handleCompanyAction = async (action, companyId, reason = '') => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      switch (action) {
        case 'activate':
          result = await deliveryCompanyService.updateCompanyStatus(
            companyId, 
            COMPANY_STATUS.ACTIVE, 
            reason, 
            adminData.email
          );
          setSuccess(SUCCESS_MESSAGES.STATUS_UPDATED);
          break;
        case 'suspend':
          result = await deliveryCompanyService.updateCompanyStatus(
            companyId, 
            COMPANY_STATUS.SUSPENDED, 
            reason, 
            adminData.email
          );
          setSuccess(SUCCESS_MESSAGES.STATUS_UPDATED);
          break;
        case 'terminate':
          result = await deliveryCompanyService.updateCompanyStatus(
            companyId, 
            COMPANY_STATUS.TERMINATED, 
            reason, 
            adminData.email
          );
          setSuccess(SUCCESS_MESSAGES.STATUS_UPDATED);
          break;
        default:
          throw new Error('Invalid action');
      }
      
      // Refresh data
      await loadCompanies();
      await loadStats();
      
      setShowCompanyModal(false);
      setSelectedCompany(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (companyData) => {
    try {
      setLoading(true);
      setError(null);
      
      await deliveryCompanyService.createCompany(companyData, adminData.email);
      setSuccess(SUCCESS_MESSAGES.COMPANY_CREATED);
      
      // Refresh data
      await loadCompanies();
      await loadStats();
      
      setShowCreateModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action, reason = '') => {
    if (selectedCompanies.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let status;
      switch (action) {
        case 'activate':
          status = COMPANY_STATUS.ACTIVE;
          break;
        case 'suspend':
          status = COMPANY_STATUS.SUSPENDED;
          break;
        case 'terminate':
          status = COMPANY_STATUS.TERMINATED;
          break;
        default:
          throw new Error('Invalid bulk action');
      }
      
      await deliveryCompanyService.bulkUpdateStatus(
        selectedCompanies,
        status,
        reason,
        adminData.email
      );
      
      setSuccess(SUCCESS_MESSAGES.BULK_UPDATE_COMPLETED);
      setSelectedCompanies([]);
      
      // Refresh data
      await loadCompanies();
      await loadStats();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCompanyModal = (company) => {
    setSelectedCompany(company);
    setShowCompanyModal(true);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case COMPANY_STATUS.ACTIVE:
        return 'text-green-600 bg-green-100';
      case COMPANY_STATUS.SUSPENDED:
        return 'text-yellow-600 bg-yellow-100';
      case COMPANY_STATUS.TERMINATED:
        return 'text-red-600 bg-red-100';
      case COMPANY_STATUS.PENDING:
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const breadcrumbs = [
    { label: 'Delivery Companies' }
  ];

  return (
    <AdminLayout title="Delivery Companies" breadcrumbs={breadcrumbs}>
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Companies</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active</h3>
            <p className="text-2xl font-bold text-green-600">{stats.activeCompanies}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Suspended</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.suspendedCompanies}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Deliveries</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalDeliveries}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Avg Delivery Time</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.avgDeliveryTime}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Manage Delivery Companies</h3>
          <button
            onClick={openCreateModal}
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Add New Company
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Companies
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search by name or email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value={COMPANY_STATUS.PENDING}>Pending</option>
              <option value={COMPANY_STATUS.ACTIVE}>Active</option>
              <option value={COMPANY_STATUS.SUSPENDED}>Suspended</option>
              <option value={COMPANY_STATUS.TERMINATED}>Terminated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limit
            </label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={25}>25 companies</option>
              <option value={50}>50 companies</option>
              <option value={100}>100 companies</option>
            </select>
          </div>
        </div>
      </div>

      {/* Success Display */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedCompanies.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedCompanies.length} company(ies) selected
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Activate Selected
              </button>
              <button
                onClick={() => handleBulkAction('suspend', 'Bulk suspension')}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Suspend Selected
              </button>
              <button
                onClick={() => handleBulkAction('terminate', 'Bulk termination')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Terminate Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Companies Table */}
      <ResponsiveAdminTable
        data={companies}
        columns={[
          {
            key: 'main',
            label: 'Company',
            render: (_, company) => (
              <div>
                <div className="text-sm font-medium text-gray-900">{company.name}</div>
                <div className="text-sm text-gray-500">{company.contactInfo?.email}</div>
                <div className="text-xs text-gray-400">{company.contactInfo?.phone}</div>
              </div>
            )
          },
          {
            key: 'status',
            label: 'Status',
            render: (_, company) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(company.status)}`}>
                {company.status.toUpperCase()}
              </span>
            )
          },
          {
            key: 'serviceAreas',
            label: 'Service Areas',
            render: (_, company) => (
              <div className="text-sm text-gray-900">
                {company.serviceAreasData?.length > 0 
                  ? `${company.serviceAreasData.length} area${company.serviceAreasData.length !== 1 ? 's' : ''}`
                  : 'No areas configured'
                }
              </div>
            )
          },
          {
            key: 'rates',
            label: 'Rates',
            render: (_, company) => (
              <div className="text-sm text-gray-900">
                {company.pricingData ? (
                  <>
                    <div>Base: ${company.pricingData.baseRates?.standard || 0}</div>
                    <div>Express: ${company.pricingData.baseRates?.express || 0}</div>
                  </>
                ) : (
                  <span className="text-gray-400">Not configured</span>
                )}
              </div>
            )
          },
          {
            key: 'date',
            label: 'Created',
            render: (_, company) => formatDate(company.createdAt)
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (_, company) => (
              <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => openCompanyModal(company)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  View Details
                </button>
                {company.status === COMPANY_STATUS.SUSPENDED && (
                  <button
                    onClick={() => handleCompanyAction('activate', company.id)}
                    className="text-green-600 hover:text-green-900 text-sm font-medium"
                  >
                    Activate
                  </button>
                )}
                {company.status === COMPANY_STATUS.ACTIVE && (
                  <button
                    onClick={() => handleCompanyAction('suspend', company.id, 'Admin action')}
                    className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                  >
                    Suspend
                  </button>
                )}
                {(company.status === COMPANY_STATUS.ACTIVE || company.status === COMPANY_STATUS.SUSPENDED) && (
                  <button
                    onClick={() => handleCompanyAction('terminate', company.id, 'Admin action')}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Terminate
                  </button>
                )}
              </div>
            )
          }
        ]}
        loading={loading}
        onRowClick={openCompanyModal}
        onRowSelect={handleCompanySelect}
        selectedRows={selectedCompanies}
        showSelection={true}
        emptyMessage="No delivery companies found."
      />

      {/* Company Details Modal */}
      <ResponsiveAdminModal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        title="Company Details"
        size="lg"
        actions={
          <button
            onClick={() => setShowCompanyModal(false)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Close
          </button>
        }
      >
        {selectedCompany && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedCompany.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedCompany.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedCompany.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCompany.status)}`}>
                  {selectedCompany.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Areas</label>
              <div className="flex flex-wrap gap-2">
                {selectedCompany.serviceAreas.map((area, index) => (
                  <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Types</label>
              <div className="flex flex-wrap gap-2">
                {selectedCompany.deliveryTypes.map((type, index) => (
                  <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Rate</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">${selectedCompany.baseRate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Express Rate</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">${selectedCompany.expressRate}</p>
              </div>
            </div>
          </div>
        )}
      </ResponsiveAdminModal>

      {/* Create Company Modal */}
      <ResponsiveAdminModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Delivery Company"
        size="xl"
      >
        <DeliveryCompanyForm
          mode="create"
          onSubmit={handleCreateCompany}
          onCancel={() => setShowCreateModal(false)}
          loading={loading}
        />
      </ResponsiveAdminModal>
    </AdminLayout>
  );
};

const DeliveryCompaniesPage = () => {
  return (
    <AdminAuthGuard requiredPermission={ADMIN_PERMISSIONS.DELIVERY_MANAGEMENT}>
      <DeliveryCompaniesContent />
    </AdminAuthGuard>
  );
};

export default DeliveryCompaniesPage;