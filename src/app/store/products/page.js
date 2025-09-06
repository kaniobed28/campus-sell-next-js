"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../stores/useAuth";
import Loading from "@/components/Loading";
import storeManagementService from "@/services/storeManagementService";
import { PRODUCT_STATUS } from "@/types/store";
import BulkEditModal from "./components/BulkEditModal";
import StatusToggle from "./components/StatusToggle";
import StatusIndicator from "./components/StatusIndicator";
import BulkStatusConfirmationDialog from "./components/BulkStatusConfirmationDialog";
import DeleteConfirmationDialog from "./components/DeleteConfirmationDialog";
import BulkDeleteConfirmationDialog from "./components/BulkDeleteConfirmationDialog";

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [pendingBulkStatus, setPendingBulkStatus] = useState(null);
  const [bulkStatusProcessing, setBulkStatusProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [deleteProcessing, setDeleteProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user, filter, sortBy]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user) {
        loadProducts();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let userProducts;
      if (searchTerm.trim()) {
        userProducts = await storeManagementService.searchSellerProducts(user.uid, {
          searchTerm: searchTerm.trim(),
          status: filter === "all" ? null : filter,
          sortBy: getSortField(sortBy),
          sortOrder: getSortOrder(sortBy)
        });
      } else {
        const result = await storeManagementService.getSellerProducts(user.uid, {
          status: filter === "all" ? null : filter,
          sortBy: getSortField(sortBy),
          sortOrder: getSortOrder(sortBy),
          limitCount: 100
        });
        userProducts = result.products;
      }

      setProducts(userProducts);
      setTotalProducts(userProducts.length);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSortField = (sortBy) => {
    switch (sortBy) {
      case "oldest": return "createdAt";
      case "price-high": return "price";
      case "price-low": return "price";
      case "views": return "viewCount";
      case "inquiries": return "inquiryCount";
      default: return "createdAt";
    }
  };

  const getSortOrder = (sortBy) => {
    switch (sortBy) {
      case "oldest": return "asc";
      case "price-low": return "asc";
      default: return "desc";
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await storeManagementService.updateProductStatus(productId, newStatus, user.uid);
      setProducts(products.map(product =>
        product.id === productId
          ? { ...product, status: newStatus, updatedAt: new Date() }
          : product
      ));
      alert(`Product status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating product status:", err);
      alert("Failed to update product status. Please try again.");
    }
  };

  const handleDelete = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async (productId) => {
    try {
      setDeleteProcessing(true);
      await storeManagementService.deleteProduct(productId, user.uid);
      setProducts(products.filter(product => product.id !== productId));
      setTotalProducts(prev => prev - 1);
      setShowDeleteDialog(false);
      setProductToDelete(null);
      alert("Product deleted successfully");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product. Please try again.");
    } finally {
      setDeleteProcessing(false);
    }
  };

  const handleDuplicate = (productId) => {
    // Navigate to duplicate page for review and modification
    window.location.href = `/store/products/duplicate/${productId}`;
  };

  const handleBulkStatusChange = (newStatus) => {
    if (selectedProducts.length === 0) return;
    
    setPendingBulkStatus(newStatus);
    setShowBulkStatusDialog(true);
  };

  const confirmBulkStatusChange = async () => {
    if (!pendingBulkStatus || selectedProducts.length === 0) return;

    try {
      setBulkStatusProcessing(true);
      await storeManagementService.bulkUpdateProductStatus(selectedProducts, pendingBulkStatus, user.uid);
      setSelectedProducts([]);
      setShowBulkActions(false);
      setShowBulkStatusDialog(false);
      setPendingBulkStatus(null);
      loadProducts();
      alert(`Successfully updated ${selectedProducts.length} products to ${pendingBulkStatus}`);
    } catch (err) {
      console.error("Error in bulk status update:", err);
      alert("Failed to update product statuses. Please try again.");
    } finally {
      setBulkStatusProcessing(false);
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = async (productIds) => {
    try {
      setDeleteProcessing(true);
      await storeManagementService.bulkDeleteProducts(productIds, user.uid);
      setSelectedProducts([]);
      setShowBulkActions(false);
      setShowBulkDeleteDialog(false);
      loadProducts();
      alert(`Successfully deleted ${productIds.length} products`);
    } catch (err) {
      console.error("Error in bulk delete:", err);
      alert("Failed to delete products. Please try again.");
    } finally {
      setDeleteProcessing(false);
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        const newSelection = prev.filter(id => id !== productId);
        setShowBulkActions(newSelection.length > 0);
        return newSelection;
      } else {
        const newSelection = [...prev, productId];
        setShowBulkActions(newSelection.length > 0);
        return newSelection;
      }
    });
  };

  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return products.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(totalProducts / productsPerPage);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedProducts([]);
    setShowBulkActions(false);
  };

  const handleSelectAll = () => {
    const currentPageProducts = getCurrentPageProducts();
    const allSelected = currentPageProducts.every(product => selectedProducts.includes(product.id));
    
    if (allSelected) {
      setSelectedProducts(prev => prev.filter(id => !currentPageProducts.some(p => p.id === id)));
    } else {
      const newSelections = currentPageProducts.map(p => p.id).filter(id => !selectedProducts.includes(id));
      setSelectedProducts(prev => [...prev, ...newSelections]);
    }
    
    setShowBulkActions(selectedProducts.length > 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "sold":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
      case "unavailable":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200";
      case "draft":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return <Loading message="Loading your products..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive text-xl mb-4">⚠️ {error}</div>
        <button
          onClick={loadProducts}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  const currentPageProducts = getCurrentPageProducts();
  const totalPages = getTotalPages();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Products</h2>
          <p className="text-muted-foreground">Manage your product listings ({totalProducts} total)</p>
        </div>
        <a
          href="/sell"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          Add New Product
        </a>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-lg shadow p-6 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Search Products</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, description, or tags..."
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            >
              <option value="all">All Products ({totalProducts})</option>
              <option value="active">Active ({products.filter(p => (p.status || 'active') === "active").length})</option>
              <option value="sold">Sold ({products.filter(p => p.status === "sold").length})</option>
              <option value="unavailable">Unavailable ({products.filter(p => p.status === "unavailable").length})</option>
              <option value="draft">Draft ({products.filter(p => p.status === "draft").length})</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="views">Most Viewed</option>
              <option value="inquiries">Most Inquiries</option>
            </select>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-primary font-medium">
                {selectedProducts.length} product(s) selected
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowBulkEditModal(true)}
                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded text-sm hover:bg-secondary/90"
                >
                  Bulk Edit
                </button>
                <button
                  onClick={() => handleBulkStatusChange(PRODUCT_STATUS.ACTIVE)}
                  className="bg-green-600 dark:bg-green-700 text-white px-3 py-1 rounded text-sm hover:bg-green-700 dark:hover:bg-green-800"
                >
                  Mark Active
                </button>
                <button
                  onClick={() => handleBulkStatusChange(PRODUCT_STATUS.SOLD)}
                  className="bg-blue-600 dark:bg-blue-700 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-800"
                >
                  Mark Sold
                </button>
                <button
                  onClick={() => handleBulkStatusChange(PRODUCT_STATUS.UNAVAILABLE)}
                  className="bg-yellow-600 dark:bg-yellow-700 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 dark:hover:bg-yellow-800"
                >
                  Mark Unavailable
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm hover:bg-destructive/90"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedProducts([]);
                    setShowBulkActions(false);
                  }}
                  className="bg-muted text-muted-foreground px-3 py-1 rounded text-sm hover:bg-muted/90"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      {currentPageProducts.length === 0 ? (
        <div className="bg-card rounded-lg shadow p-12 text-center">
          <div className="text-muted-foreground text-6xl mb-4">📦</div>
          <h3 className="text-xl font-medium text-foreground mb-2">
            {filter === "all" ? "No products yet" : `No ${filter} products`}
          </h3>
          <p className="text-muted-foreground mb-6">
            {filter === "all" 
              ? "Start by creating your first product listing"
              : `You don't have any ${filter} products at the moment`
            }
          </p>
          {filter === "all" && (
            <a
              href="/sell"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90"
            >
              Create First Product
            </a>
          )}
        </div>
      ) : (
        <>
          <div className="bg-card rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={currentPageProducts.length > 0 && currentPageProducts.every(product => selectedProducts.includes(product.id))}
                        onChange={handleSelectAll}
                        className="rounded border-input"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {currentPageProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleProductSelect(product.id)}
                          className="rounded border-input"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {product.imageUrls && product.imageUrls[0] ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={product.imageUrls[0]}
                                alt={product.title}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                <span className="text-muted-foreground">📷</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">
                              {product.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {product.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        ${product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusIndicator 
                          status={product.status || "active"} 
                          size="sm" 
                          showIcon={true}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        <div className="space-y-1">
                          <div>{product.viewCount || 0} views</div>
                          <div>{product.inquiryCount || 0} inquiries</div>
                          <div>{product.favoriteCount || 0} favorites</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-1">
                          <a
                            href={`/listings/${product.id}`}
                            className="text-primary hover:text-primary/80"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                          <a
                            href={`/store/products/edit/${product.id}`}
                            className="text-secondary-foreground hover:text-secondary-foreground/80 text-left"
                          >
                            Edit
                          </a>
                          <button
                            onClick={() => handleDuplicate(product.id)}
                            className="text-accent-foreground hover:text-accent-foreground/80 text-left"
                          >
                            Duplicate
                          </button>
                          <StatusToggle
                            productId={product.id}
                            currentStatus={product.status || "active"}
                            onStatusChange={handleStatusChange}
                            showConfirmation={true}
                          />
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-destructive hover:text-destructive/80 text-left"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-card rounded-lg shadow p-4 border border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-input rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted bg-background text-foreground"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-input hover:bg-muted bg-background text-foreground'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-input rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted bg-background text-foreground"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        selectedProducts={selectedProducts}
        products={products}
        onSuccess={() => {
          setSelectedProducts([]);
          setShowBulkActions(false);
          loadProducts();
        }}
      />

      {/* Bulk Status Confirmation Dialog */}
      <BulkStatusConfirmationDialog
        isOpen={showBulkStatusDialog}
        onClose={() => {
          setShowBulkStatusDialog(false);
          setPendingBulkStatus(null);
        }}
        onConfirm={confirmBulkStatusChange}
        selectedProducts={selectedProducts}
        products={products}
        newStatus={pendingBulkStatus}
        isProcessing={bulkStatusProcessing}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
        product={productToDelete}
        isProcessing={deleteProcessing}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <BulkDeleteConfirmationDialog
        isOpen={showBulkDeleteDialog}
        onClose={() => setShowBulkDeleteDialog(false)}
        onConfirm={confirmBulkDelete}
        selectedProducts={selectedProducts}
        products={products}
        isProcessing={deleteProcessing}
      />
    </div>
  );
};

export default ProductsPage;