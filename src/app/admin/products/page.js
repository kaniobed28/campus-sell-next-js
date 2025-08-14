"use client";
import React, { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import ResponsiveAdminTable from '@/components/admin/ResponsiveAdminTable';
import ResponsiveAdminModal from '@/components/admin/ResponsiveAdminModal';
import { productModerationService } from '@/services/productModerationService';
import { useAuditLog } from '@/hooks/useAuditLog';
import { ADMIN_PERMISSIONS, PRODUCT_STATUS, AUDIT_ACTION_TYPES } from '@/types/admin';

const ProductModerationContent = () => {
  const [products, setProducts] = useState([]);
  const [reportedProducts, setReportedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'reported', 'blocked', 'removed'
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    category: '',
    limit: 50
  });

  const { logProductAction } = useAuditLog();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        loadProducts(),
        loadReportedProducts(),
        loadModerationStats()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      let products;
      
      if (activeTab === 'blocked') {
        products = await productModerationService.getProductsByStatus(PRODUCT_STATUS.BLOCKED, filters.limit);
      } else if (activeTab === 'removed') {
        products = await productModerationService.getProductsByStatus(PRODUCT_STATUS.REMOVED, filters.limit);
      } else if (filters.search && filters.search.trim().length >= 2) {
        products = await productModerationService.searchProducts(filters.search, filters.limit);
      } else {
        const productFilters = { ...filters, includeAll: true };
        products = await productModerationService.getActiveProducts(productFilters);
      }
      
      setProducts(products);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const loadReportedProducts = async () => {
    try {
      if (activeTab === 'reported') {
        const reported = await productModerationService.getReportedProducts(filters.limit);
        setReportedProducts(reported);
      }
    } catch (err) {
      console.error('Failed to load reported products:', err);
    }
  };

  const loadModerationStats = async () => {
    try {
      const moderationStats = await productModerationService.getModerationStats();
      setStats(moderationStats);
    } catch (err) {
      console.error('Failed to load moderation stats:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    loadProducts();
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      category: '',
      limit: 50
    });
    setTimeout(loadProducts, 100);
  };

  const handleProductSelect = (productId, checked) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (checked) => {
    const currentProducts = activeTab === 'reported' ? reportedProducts : products;
    if (checked) {
      setSelectedProducts(currentProducts.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleProductAction = async (action, productId, reason = '') => {
    try {
      setLoading(true);
      let result;
      
      switch (action) {
        case 'block':
          result = await productModerationService.blockProduct(productId, reason, 'current-admin');
          await logProductAction(AUDIT_ACTION_TYPES.PRODUCT_BLOCKED, productId, { reason });
          break;
        case 'unblock':
          result = await productModerationService.unblockProduct(productId, 'current-admin');
          await logProductAction(AUDIT_ACTION_TYPES.PRODUCT_RESTORED, productId, {});
          break;
        case 'remove':
          result = await productModerationService.removeProduct(productId, reason, 'current-admin');
          await logProductAction(AUDIT_ACTION_TYPES.PRODUCT_REMOVED, productId, { reason });
          break;
        case 'restore':
          result = await productModerationService.restoreProduct(productId, 'current-admin');
          await logProductAction(AUDIT_ACTION_TYPES.PRODUCT_RESTORED, productId, {});
          break;
        default:
          throw new Error('Invalid action');
      }
      
      // Refresh data
      await loadData();
      
      setShowProductModal(false);
      setSelectedProduct(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action, reason = '') => {
    if (selectedProducts.length === 0) return;
    
    try {
      setLoading(true);
      
      const newStatus = action === 'block' ? PRODUCT_STATUS.BLOCKED : 
                       action === 'remove' ? PRODUCT_STATUS.REMOVED : PRODUCT_STATUS.ACTIVE;
      
      await productModerationService.bulkUpdateProductStatus(
        selectedProducts,
        newStatus,
        reason,
        'current-admin'
      );
      
      // Log bulk action
      await logProductAction(`bulk_${action}`, 'multiple', { 
        productCount: selectedProducts.length, 
        reason 
      });
      
      setSelectedProducts([]);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case PRODUCT_STATUS.ACTIVE:
        return 'text-green-600 bg-green-100';
      case PRODUCT_STATUS.BLOCKED:
        return 'text-yellow-600 bg-yellow-100';
      case PRODUCT_STATUS.REMOVED:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const breadcrumbs = [
    { label: 'Product Moderation' }
  ];

  const currentProducts = activeTab === 'reported' ? reportedProducts : products;

  return (
    <AdminLayout title="Product Moderation" breadcrumbs={breadcrumbs}>
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Products</h3>
            <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Blocked</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.blockedProducts}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Removed</h3>
            <p className="text-2xl font-bold text-red-600">{stats.removedProducts}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Products', count: stats?.totalProducts },
              { key: 'reported', label: 'Reported', count: stats?.totalReports },
              { key: 'blocked', label: 'Blocked', count: stats?.blockedProducts },
              { key: 'removed', label: 'Removed', count: stats?.removedProducts }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Products
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search by title or description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Filter by category"
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
                <option value={PRODUCT_STATUS.ACTIVE}>Active</option>
                <option value={PRODUCT_STATUS.BLOCKED}>Blocked</option>
                <option value={PRODUCT_STATUS.REMOVED}>Removed</option>
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
                <option value={25}>25 products</option>
                <option value={50}>50 products</option>
                <option value={100}>100 products</option>
                <option value={200}>200 products</option>
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
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedProducts.length} product(s) selected
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleBulkAction('unblock')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Unblock Selected
              </button>
              <button
                onClick={() => handleBulkAction('block', 'Bulk block')}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
              >
                Block Selected
              </button>
              <button
                onClick={() => handleBulkAction('remove', 'Bulk removal')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Remove Selected
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

      {/* Products Table */}
      <ResponsiveAdminTable
        data={currentProducts}
        columns={[
          {
            key: 'main',
            label: 'Product',
            render: (_, product) => (
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 mr-4">
                  {product.images && product.images[0] ? (
                    <img 
                      className="h-10 w-10 rounded object-cover" 
                      src={product.images[0]} 
                      alt={product.title}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {product.title || 'Untitled'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.category || 'No Category'}
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'status',
            label: 'Status',
            render: (_, product) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status || PRODUCT_STATUS.ACTIVE)}`}>
                {(product.status || PRODUCT_STATUS.ACTIVE).toUpperCase()}
              </span>
            )
          },
          {
            key: 'price',
            label: 'Price',
            render: (_, product) => formatPrice(product.price)
          },
          {
            key: 'date',
            label: 'Created',
            render: (_, product) => formatDate(product.createdAt)
          },
          ...(activeTab === 'reported' ? [{
            key: 'reports',
            label: 'Reports',
            render: (_, product) => (
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                {product.reportCount || 0} reports
              </span>
            )
          }] : []),
          {
            key: 'actions',
            label: 'Actions',
            render: (_, product) => (
              <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => openProductModal(product)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  View Details
                </button>
                {product.status === PRODUCT_STATUS.BLOCKED && (
                  <button
                    onClick={() => handleProductAction('unblock', product.id)}
                    className="text-green-600 hover:text-green-900 text-sm font-medium"
                  >
                    Unblock
                  </button>
                )}
                {(product.status === PRODUCT_STATUS.ACTIVE || !product.status) && (
                  <button
                    onClick={() => handleProductAction('block', product.id, 'Admin action')}
                    className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                  >
                    Block
                  </button>
                )}
                {product.status !== PRODUCT_STATUS.REMOVED && (
                  <button
                    onClick={() => handleProductAction('remove', product.id, 'Admin action')}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
                {product.status === PRODUCT_STATUS.REMOVED && (
                  <button
                    onClick={() => handleProductAction('restore', product.id)}
                    className="text-green-600 hover:text-green-900 text-sm font-medium"
                  >
                    Restore
                  </button>
                )}
              </div>
            )
          }
        ]}
        loading={loading}
        onRowClick={openProductModal}
        onRowSelect={(selectedIds) => setSelectedProducts(selectedIds)}
        selectedRows={selectedProducts}
        showSelection={true}
        emptyMessage="No products found matching the current filters."
      />

      {/* Product Details Modal */}
      <ResponsiveAdminModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Product Details"
        size="xl"
        actions={
          <button
            onClick={() => setShowProductModal(false)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Close
          </button>
        }
      >
        {selectedProduct && (
          <div className="space-y-6">
            {/* Product Images */}
            {selectedProduct.images && selectedProduct.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {selectedProduct.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedProduct.title || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded max-h-32 overflow-y-auto">{selectedProduct.description || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{formatPrice(selectedProduct.price)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedProduct.category || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProduct.status || PRODUCT_STATUS.ACTIVE)}`}>
                    {(selectedProduct.status || PRODUCT_STATUS.ACTIVE).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                  <p className="text-sm text-gray-900 font-mono p-2 bg-gray-50 rounded break-all">{selectedProduct.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seller ID</label>
                  <p className="text-sm text-gray-900 font-mono p-2 bg-gray-50 rounded break-all">{selectedProduct.sellerId || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{formatDate(selectedProduct.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{formatDate(selectedProduct.updatedAt)}</p>
                </div>
                
                {selectedProduct.blockReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Block Reason</label>
                    <p className="text-sm text-gray-900 p-3 bg-yellow-50 border border-yellow-200 rounded">{selectedProduct.blockReason}</p>
                  </div>
                )}
                
                {selectedProduct.removeReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Removal Reason</label>
                    <p className="text-sm text-gray-900 p-3 bg-red-50 border border-red-200 rounded">{selectedProduct.removeReason}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedProduct.reports && selectedProduct.reports.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reports ({selectedProduct.reports.length})</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedProduct.reports.map((report, index) => (
                    <div key={index} className="bg-red-50 p-3 rounded border border-red-200">
                      <p className="text-sm font-medium text-red-800">Reason: {report.reason || 'No reason provided'}</p>
                      <p className="text-xs text-red-600 mt-1">Reported: {formatDate(report.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons for mobile */}
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 pt-4 border-t">
              {selectedProduct.status === PRODUCT_STATUS.BLOCKED && (
                <button
                  onClick={() => {
                    handleProductAction('unblock', selectedProduct.id);
                    setShowProductModal(false);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Unblock Product
                </button>
              )}
              {(selectedProduct.status === PRODUCT_STATUS.ACTIVE || !selectedProduct.status) && (
                <button
                  onClick={() => {
                    handleProductAction('block', selectedProduct.id, 'Admin action');
                    setShowProductModal(false);
                  }}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  Block Product
                </button>
              )}
              {selectedProduct.status !== PRODUCT_STATUS.REMOVED && (
                <button
                  onClick={() => {
                    handleProductAction('remove', selectedProduct.id, 'Admin action');
                    setShowProductModal(false);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Remove Product
                </button>
              )}
              {selectedProduct.status === PRODUCT_STATUS.REMOVED && (
                <button
                  onClick={() => {
                    handleProductAction('restore', selectedProduct.id);
                    setShowProductModal(false);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Restore Product
                </button>
              )}
            </div>
          </div>
        )}
      </ResponsiveAdminModal>
    </AdminLayout>
  );
};

const ProductModerationPage = () => {
  return (
    <AdminAuthGuard requiredPermission={ADMIN_PERMISSIONS.PRODUCT_MODERATION}>
      <ProductModerationContent />
    </AdminAuthGuard>
  );
};

export default ProductModerationPage;




