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
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
          <button
            onClick={() => loadUserOrders()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600">Track and manage your orders</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter ? `No ${statusFilter} orders found.` : "You haven't placed any orders yet."}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
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
                          <span className="text-gray-500">Order Date:</span>
                          <p className="font-medium">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Delivery Address:</span>
                          <p className="font-medium">📍 {order.deliveryDetails?.address}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Delivery Company:</span>
                          <p className="font-medium">{order.deliveryInfo?.companyName || 'Not assigned'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Delivery Fee:</span>
                          <p className="font-medium">💰 ${order.deliveryInfo?.deliveryRate || 0}</p>
                        </div>
                      </div>

                      {order.deliveryDetails?.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-500 text-sm">Special Instructions:</span>
                          <p className="text-sm italic">💬 {order.deliveryDetails.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                      >
                        📋 View Details
                      </button>
                      
                      {order.status === 'pending' && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                        >
                          ❌ Cancel Order
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <div className="text-center">
                          <div className="text-green-600 text-sm font-medium">✅ Delivered</div>
                          {order.deliveredAt && (
                            <div className="text-gray-500 text-xs">
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Details - #{selectedOrder.id.slice(-8)}
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">📊 Order Status</h4>
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
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">🚚 Delivery Information</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
                        <p className="text-sm text-gray-900">📍 {selectedOrder.deliveryDetails?.address}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                        <p className="text-sm text-gray-900">👤 {selectedOrder.deliveryDetails?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <p className="text-sm text-gray-900">📞 {selectedOrder.deliveryDetails?.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Company</label>
                        <p className="text-sm text-gray-900">{selectedOrder.deliveryInfo?.companyName || 'Not assigned yet'}</p>
                      </div>
                    </div>
                    {selectedOrder.deliveryDetails?.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
                        <p className="text-sm text-gray-900 italic">💬 {selectedOrder.deliveryDetails.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Details */}
                {selectedOrder.deliveryInfo && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">📦 Delivery Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Type</label>
                        <p className="text-sm text-gray-900">{selectedOrder.deliveryInfo.selectedOption?.name || 'Standard'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Fee</label>
                        <p className="text-sm text-gray-900">💰 ${selectedOrder.deliveryInfo.deliveryRate || 0}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estimated Time</label>
                        <p className="text-sm text-gray-900">⏱️ {selectedOrder.deliveryInfo.estimatedDeliveryTime || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">🛍️ Order Items</h4>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-yellow-200 last:border-b-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Product ID: {item.productId}</p>
                          </div>
                          <div className="text-sm text-gray-600">
                            Qty: {item.quantity || 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No item details available</p>
                  )}
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">🕒 Order Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Placed:</span>
                      <span className="text-gray-900">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    {selectedOrder.updatedAt && selectedOrder.updatedAt !== selectedOrder.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="text-gray-900">{formatDate(selectedOrder.updatedAt)}</span>
                      </div>
                    )}
                    {selectedOrder.deliveredAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivered:</span>
                        <span className="text-green-600 font-medium">{formatDate(selectedOrder.deliveredAt)}</span>
                      </div>
                    )}
                    {selectedOrder.cancelledAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cancelled:</span>
                        <span className="text-red-600 font-medium">{formatDate(selectedOrder.cancelledAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
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



