"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../stores/useAuth';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const OrdersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      loadUserOrders();
    } else if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [authLoading, user]);

  const loadUserOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );
      const ordersSnapshot = await getDocs(ordersQuery);

      const ordersData = [];
      ordersSnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort by creation date (newest first)
      ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(ordersData);

    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Refresh orders
      await loadUserOrders();
      alert('Order cancelled successfully');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    return !statusFilter || order.status === statusFilter;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-destructive text-xl mb-4">⚠️ {error}</div>
          <button
            onClick={() => loadUserOrders()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
              <p className="text-muted-foreground">Track and manage your orders</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="bg-card rounded-lg shadow p-6 mb-6 border border-border">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => loadUserOrders()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-card rounded-lg shadow p-12 text-center border border-border">
            <div className="text-muted-foreground text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-foreground mb-2">No Orders Found</h3>
            <p className="text-muted-foreground mb-6">
              {statusFilter ? `No ${statusFilter} orders found.` : "You haven't placed any orders yet."}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-card rounded-lg shadow hover:shadow-md transition-shadow border border-border">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-lg font-semibold text-foreground">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status === 'pending' ? '⏳ PENDING' :
                           order.status === 'in_progress' ? '🚚 IN PROGRESS' :
                           order.status === 'delivered' ? '✅ DELIVERED' :
                           order.status === 'cancelled' ? '❌ CANCELLED' :
                           order.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Order Date:</span>
                          <p className="font-medium text-foreground">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Delivery Address:</span>
                          <p className="font-medium text-foreground">📍 {order.deliveryDetails?.address}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Delivery Company:</span>
                          <p className="font-medium text-foreground">{order.deliveryInfo?.companyName || 'Not assigned'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Delivery Fee:</span>
                          <p className="font-medium text-foreground">💰 ${order.deliveryInfo?.deliveryRate || 0}</p>
                        </div>
                      </div>

                      {order.deliveryDetails?.notes && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <span className="text-muted-foreground text-sm">Special Instructions:</span>
                          <p className="text-sm italic text-foreground">💬 {order.deliveryDetails.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm transition-colors"
                      >
                        📋 View Details
                      </button>
                      
                      {order.status === 'pending' && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 text-sm transition-colors"
                        >
                          ❌ Cancel Order
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <div className="text-center">
                          <div className="text-green-600 dark:text-green-400 text-sm font-medium">✅ Delivered</div>
                          {order.deliveredAt && (
                            <div className="text-muted-foreground text-xs">
                              {formatDate(order.deliveredAt)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border border-border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Order Details - #{selectedOrder.id.slice(-8)}
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Status */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-3">📊 Order Status</h4>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status === 'pending' ? '⏳ PENDING' :
                       selectedOrder.status === 'in_progress' ? '🚚 IN PROGRESS' :
                       selectedOrder.status === 'delivered' ? '✅ DELIVERED' :
                       selectedOrder.status === 'cancelled' ? '❌ CANCELLED' :
                       selectedOrder.status.toUpperCase()}
                    </span>
                    {selectedOrder.status === 'pending' && (
                      <button
                        onClick={() => {
                          cancelOrder(selectedOrder.id);
                          setShowOrderModal(false);
                        }}
                        className="bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm hover:bg-destructive/90 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-3">🚚 Delivery Information</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground">Delivery Address</label>
                        <p className="text-sm text-foreground">📍 {selectedOrder.deliveryDetails?.address}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground">Contact Name</label>
                        <p className="text-sm text-foreground">👤 {selectedOrder.deliveryDetails?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground">Phone Number</label>
                        <p className="text-sm text-foreground">📞 {selectedOrder.deliveryDetails?.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground">Delivery Company</label>
                        <p className="text-sm text-foreground">{selectedOrder.deliveryInfo?.companyName || 'Not assigned yet'}</p>
                      </div>
                    </div>
                    {selectedOrder.deliveryDetails?.notes && (
                      <div>
                        <label className="block text-sm font-medium text-foreground">Special Instructions</label>
                        <p className="text-sm text-foreground italic">💬 {selectedOrder.deliveryDetails.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Details */}
                {selectedOrder.deliveryInfo && (
                  <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-lg">
                    <h4 className="font-medium text-foreground mb-3">📦 Delivery Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground">Delivery Type</label>
                        <p className="text-sm text-foreground">{selectedOrder.deliveryInfo.selectedOption?.name || 'Standard'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground">Delivery Fee</label>
                        <p className="text-sm text-foreground">💰 ${selectedOrder.deliveryInfo.deliveryRate || 0}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground">Estimated Time</label>
                        <p className="text-sm text-foreground">⏱️ {selectedOrder.deliveryInfo.estimatedDeliveryTime || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-3">🛍️ Order Items</h4>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                          <div>
                            <p className="text-sm font-medium text-foreground">Product ID: {item.productId}</p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Qty: {item.quantity || 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No item details available</p>
                  )}
                </div>

                {/* Timeline */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-3">🕒 Order Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Placed:</span>
                      <span className="text-foreground">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    {selectedOrder.updatedAt && selectedOrder.updatedAt !== selectedOrder.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span className="text-foreground">{formatDate(selectedOrder.updatedAt)}</span>
                      </div>
                    )}
                    {selectedOrder.deliveredAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivered:</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">{formatDate(selectedOrder.deliveredAt)}</span>
                      </div>
                    )}
                    {selectedOrder.cancelledAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cancelled:</span>
                        <span className="text-destructive font-medium">{formatDate(selectedOrder.cancelledAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;