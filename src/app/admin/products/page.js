"use client";
import React, { useState, useEffect } from 'react';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import ResponsiveAdminTable from '@/components/admin/ResponsiveAdminTable';
import ResponsiveAdminModal from '@/components/admin/ResponsiveAdminModal';
import { productModerationService } from '@/services/productModerationService';
import { realtimeProductService } from '@/services/realtimeProductService';
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
    // Subscribe to real-time updates for all products in admin view
    const unsubscribe = realtimeProductService.subscribeToAllProducts((productsData) => {
      setProducts(productsData);
      
      // Update stats when products change
      updateModerationStats(productsData);
      
      // If we're on the reported tab, also update reported products
      if (activeTab === 'reported') {
        loadReportedProducts();
      }
    });
    
    // Load initial data
    loadData();
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [activeTab]);

  const updateModerationStats = (productsData) => {
    if (!productsData) return;
    
    const stats = {
      totalProducts: productsData.length,
      activeProducts: productsData.filter(p => p.status === PRODUCT_STATUS.ACTIVE || !p.status).length,
      blockedProducts: productsData.filter(p => p.status === PRODUCT_STATUS.BLOCKED).length,
      removedProducts: productsData.filter(p => p.status === PRODUCT_STATUS.REMOVED).length,
      recentProducts: productsData.filter(p => {
        if (!p.createdAt) return false;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return p.createdAt > weekAgo;
      }).length,
      statusDistribution: {}
    };

    // Calculate status distribution
    productsData.forEach(product => {
      const status = product.status || PRODUCT_STATUS.ACTIVE;
      stats.statusDistribution[status] = (stats.statusDistribution[status] || 0) + 1;
    });

    setStats(stats);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        loadReportedProducts(),
        loadModerationStats()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    // Filters are now applied in real-time through the subscription
    // This function can be used for additional client-side filtering if needed
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      category: '',
      limit: 50
    });
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
      
      // The UI will automatically update due to real-time subscription
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
      // The UI will automatically update due to real-time subscription
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

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const getFilteredProducts = () => {
    let filtered = products;
    
    if (activeTab === 'blocked') {
      filtered = products.filter(p => p.status === PRODUCT_STATUS.BLOCKED);
    } else if (activeTab === 'removed') {
      filtered = products.filter(p => p.status === PRODUCT_STATUS.REMOVED);
    } else if (filters.search && filters.search.trim().length >= 2) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = products.filter(p => 
        (p.title && p.title.toLowerCase().includes(searchTerm)) ||
        (p.description && p.description.toLowerCase().includes(searchTerm))
      );
    } else if (filters.status) {
      filtered = products.filter(p => p.status === filters.status);
    }
    
    return filtered.slice(0, filters.limit);
  };

  const currentProducts = getFilteredProducts();

  // Safely get the first image URL from a product
  const getProductImageUrl = (product) => {
    // Handle case where product is undefined or null
    if (!product) {
      return '/default-image.jpg';
    }
    
    // Handle case where product.imageUrls is undefined or not an array
    if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      return product.imageUrls[0];
    }
    
    // Fallback to product.image if available
    if (product.image) {
      return product.image;
    }
    
    // Default fallback image
    return '/default-image.jpg';
  };

  return (
    <AdminLayout 
      title="Product Moderation" 
      permissions={[ADMIN_PERMISSIONS.PRODUCT_MODERATION]}
      loading={loading}
      error={error}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-primary">{stats.totalProducts}</div>
              <div className="text-muted-foreground">Total Products</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-green-500">{stats.activeProducts}</div>
              <div className="text-muted-foreground">Active Products</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-yellow-500">{stats.blockedProducts}</div>
              <div className="text-muted-foreground">Blocked Products</div>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-red-500">{stats.removedProducts}</div>
              <div className="text-muted-foreground">Removed Products</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setActiveTab('reported')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reported'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              Reported ({reportedProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('blocked')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blocked'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              Blocked
            </button>
            <button
              onClick={() => setActiveTab('removed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'removed'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              Removed
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Category
              </label>
              <input
                type="text"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                placeholder="Filter by category"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              >
                <option value="">All Statuses</option>
                <option value={PRODUCT_STATUS.ACTIVE}>Active</option>
                <option value={PRODUCT_STATUS.BLOCKED}>Blocked</option>
                <option value={PRODUCT_STATUS.REMOVED}>Removed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Limit
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
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
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 disabled:opacity-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <ResponsiveAdminTable
            data={activeTab === 'reported' ? reportedProducts : currentProducts}
            columns={[
              { 
                header: 'Product', 
                accessor: 'title',
                render: (title, product) => (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img 
                        className="h-10 w-10 rounded-md object-cover" 
                        src={getProductImageUrl(product)} 
                        alt={product.title || 'Product image'}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-foreground">{product.title || 'Untitled Product'}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.category || 'Uncategorized'} • ${product.price || 0}
                      </div>
                    </div>
                  </div>
                )
              },
              { 
                header: 'Status', 
                accessor: 'status',
                render: (status, product) => {
                  let statusClass = 'bg-gray-100 text-gray-800';
                  let statusText = 'Active';
                  
                  switch (product.status) {
                    case PRODUCT_STATUS.BLOCKED:
                      statusClass = 'bg-yellow-100 text-yellow-800';
                      statusText = 'Blocked';
                      break;
                    case PRODUCT_STATUS.REMOVED:
                      statusClass = 'bg-red-100 text-red-800';
                      statusText = 'Removed';
                      break;
                    default:
                      statusClass = 'bg-green-100 text-green-800';
                      statusText = 'Active';
                  }
                  
                  return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                      {statusText}
                    </span>
                  );
                }
              },
              { 
                header: 'Seller', 
                accessor: 'sellerId',
                render: (sellerId, product) => (
                  <div className="text-sm text-foreground">
                    {product.sellerName || product.sellerId || 'Unknown'}
                  </div>
                )
              },
              { 
                header: 'Views', 
                accessor: 'views',
                render: (views, product) => (
                  <div className="text-sm text-foreground">
                    {product.views || 0}
                  </div>
                )
              },
              { 
                header: 'Likes', 
                accessor: 'likes',
                render: (likes, product) => (
                  <div className="text-sm text-foreground">
                    {product.likes || 0}
                  </div>
                )
              },
              { 
                header: 'Price', 
                accessor: 'price',
                render: (price, product) => (
                  <div className="text-sm font-medium text-foreground">
                    ${product.price || 0}
                  </div>
                )
              },
              { 
                header: 'Created', 
                accessor: 'createdAt',
                render: (createdAt, product) => (
                  <div className="text-sm text-foreground">
                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                )
              },
              {
                header: 'Actions',
                accessor: 'actions',
                render: (actions, product) => (
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openProductModal(product);
                      }}
                      className="text-primary hover:text-primary/80"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductAction('block', product.id);
                      }}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductAction('remove', product.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )
              }
            ]}
            onRowClick={openProductModal}
            onRowSelect={handleProductSelect}
            selectedRows={selectedProducts}
            showSelection={true}
          />
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-foreground">
                {selectedProducts.length} product(s) selected
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('unblock')}
                  className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
                >
                  Unblock
                </button>
                <button
                  onClick={() => handleBulkAction('block')}
                  className="bg-yellow-600 text-white px-3 py-1.5 rounded text-sm hover:bg-yellow-700"
                >
                  Block
                </button>
                <button
                  onClick={() => handleBulkAction('restore')}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                >
                  Restore
                </button>
                <button
                  onClick={() => handleBulkAction('remove')}
                  className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showProductModal && selectedProduct && (
          <ResponsiveAdminModal
            title="Product Details"
            onClose={closeProductModal}
            size="lg"
          >
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={getProductImageUrl(selectedProduct)}
                    alt={selectedProduct.title || 'Product image'}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{selectedProduct.title || 'Untitled Product'}</h3>
                    <p className="text-muted-foreground mt-1">${selectedProduct.price || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.description || 'No description provided'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Category</p>
                      <p className="text-sm text-muted-foreground">{selectedProduct.category || 'Uncategorized'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Status</p>
                      <p className="text-sm text-muted-foreground capitalize">{selectedProduct.status || 'active'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Seller</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedProduct.sellerName || selectedProduct.sellerId || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedProduct.status === PRODUCT_STATUS.BLOCKED && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Blocked:</strong> {selectedProduct.blockReason || 'No reason provided'}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Blocked by {selectedProduct.blockedBy || 'Unknown'} on{' '}
                        {selectedProduct.blockedAt ? new Date(selectedProduct.blockedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedProduct.status === PRODUCT_STATUS.REMOVED && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        <strong>Removed:</strong> {selectedProduct.removeReason || 'No reason provided'}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Removed by {selectedProduct.removedBy || 'Unknown'} on{' '}
                        {selectedProduct.removedAt ? new Date(selectedProduct.removedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                {selectedProduct.status === PRODUCT_STATUS.ACTIVE && (
                  <>
                    <button
                      onClick={() => handleProductAction('block', selectedProduct.id)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                    >
                      Block Product
                    </button>
                    <button
                      onClick={() => handleProductAction('remove', selectedProduct.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Remove Product
                    </button>
                  </>
                )}
                
                {selectedProduct.status === PRODUCT_STATUS.BLOCKED && (
                  <>
                    <button
                      onClick={() => handleProductAction('unblock', selectedProduct.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Unblock Product
                    </button>
                    <button
                      onClick={() => handleProductAction('remove', selectedProduct.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Remove Product
                    </button>
                  </>
                )}
                
                {selectedProduct.status === PRODUCT_STATUS.REMOVED && (
                  <button
                    onClick={() => handleProductAction('restore', selectedProduct.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Restore Product
                  </button>
                )}
                
                <button
                  onClick={closeProductModal}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90"
                >
                  Close
                </button>
              </div>
            </div>
          </ResponsiveAdminModal>
        )}
      </div>
    </AdminLayout>
  );
};

const ProductModerationPage = () => {
  return (
    <AdminAuthGuard permissions={[ADMIN_PERMISSIONS.PRODUCT_MODERATION]}>
      <ProductModerationContent />
    </AdminAuthGuard>
  );
};

export default ProductModerationPage;