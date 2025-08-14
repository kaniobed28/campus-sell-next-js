"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../stores/useAuth';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { deliveryCompanyService } from '@/services/deliveryCompanyService';

const DeliveryDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [deliveryCompany, setDeliveryCompany] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    delivered: 0,
    total: 0
  });

  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesSearch = !searchTerm ||
      order.deliveryDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryDetails?.phone?.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  useEffect(() => {
    if (!authLoading && user) {
      loadDeliveryCompanyData();
    } else if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [authLoading, user]);

  const loadDeliveryCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Find delivery company by email
      const companiesQuery = query(
        collection(db, "deliveryCompanies"),
        where("contactInfo.email", "==", user.email)
      );
      const companiesSnapshot = await getDocs(companiesQuery);

      if (companiesSnapshot.empty) {
        setError("No delivery company found for this email. Please contact admin.");
        return;
      }

      const companyData = {
        id: companiesSnapshot.docs[0].id,
        ...companiesSnapshot.docs[0].data()
      };
      setDeliveryCompany(companyData);

      // Load orders assigned to this company
      await loadOrders(companyData.id);

    } catch (err) {
      console.error('Error loading delivery company data:', err);
      setError('Failed to load delivery company data');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (companyId) => {
    try {
      // Get orders assigned to this delivery company
      const ordersQuery = query(
        collection(db, "orders"),
        where("deliveryInfo.companyId", "==", companyId)
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

      // Calculate stats
      const newStats = {
        pending: ordersData.filter(o => o.status === 'pending').length,
        inProgress: ordersData.filter(o => o.status === 'in_progress').length,
        delivered: ordersData.filter(o => o.status === 'delivered').length,
        total: ordersData.length
      };
      setStats(newStats);

    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(newStatus === 'delivered' && { deliveredAt: new Date().toISOString() })
      });

      // Refresh orders
      await loadOrders(deliveryCompany.id);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
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
            onClick={() => loadDeliveryCompanyData()}
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
              <h1 className="text-3xl font-bold text-gray-900">
                {deliveryCompany?.name || 'Delivery Dashboard'}
              </h1>
              <p className="text-gray-600">Welcome back, {user.email}</p>
            </div>
            <button
              onClick={() => {
                // Add logout functionality
                router.push('/auth');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🚚</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.delivered}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">📦</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-4">
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
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Customer</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or phone..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => loadOrders(deliveryCompany.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Delivery Orders</h2>
            <div className="text-sm text-gray-500">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-xl mb-4">📦</div>
              <p className="text-gray-500">No orders assigned yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          #{order.id.slice(-8)}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{order.deliveryDetails?.name}</div>
                        <div className="text-sm text-gray-500">{order.deliveryDetails?.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          📍 {order.deliveryDetails?.address}
                        </div>
                        {order.deliveryDetails?.notes && (
                          <div className="text-sm text-gray-500 italic">
                            💬 {order.deliveryDetails.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status === 'pending' ? '⏳ PENDING' :
                            order.status === 'in_progress' ? '🚚 IN PROGRESS' :
                              order.status === 'delivered' ? '✅ DELIVERED' :
                                order.status === 'cancelled' ? '❌ CANCELLED' :
                                  order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{order.deliveryInfo?.selectedOption?.name || 'Standard'}</div>
                        <div className="text-gray-500">💰 ${order.deliveryInfo?.deliveryRate || 0}</div>
                        <div className="text-gray-500 text-xs">⏱️ {order.deliveryInfo?.estimatedDeliveryTime || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-1">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'in_progress')}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                            >
                              🚚 Start Delivery
                            </button>
                          )}
                          {order.status === 'in_progress' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                            >
                              ✅ Mark Delivered
                            </button>
                          )}
                          {order.status === 'delivered' && (
                            <span className="text-green-600 text-xs font-medium">✅ Completed</span>
                          )}
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            📋 View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
                {/* Customer Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">👤 Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-sm text-gray-900">{selectedOrder.deliveryDetails?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">
                        <a href={`tel:${selectedOrder.deliveryDetails?.phone}`} className="text-blue-600 hover:text-blue-800">
                          📞 {selectedOrder.deliveryDetails?.phone}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">🚚 Delivery Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
                      <p className="text-sm text-gray-900">📍 {selectedOrder.deliveryDetails?.address}</p>
                    </div>
                    {selectedOrder.deliveryDetails?.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
                        <p className="text-sm text-gray-900 italic">💬 {selectedOrder.deliveryDetails.notes}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Type</label>
                        <p className="text-sm text-gray-900">{selectedOrder.deliveryInfo?.selectedOption?.name || 'Standard'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivery Fee</label>
                        <p className="text-sm text-gray-900">💰 ${selectedOrder.deliveryInfo?.deliveryRate || 0}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estimated Time</label>
                        <p className="text-sm text-gray-900">⏱️ {selectedOrder.deliveryInfo?.estimatedDeliveryTime || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">📦 Order Items</h4>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-green-200 last:border-b-0">
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

                {/* Status and Actions */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">📊 Status & Actions</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status === 'pending' ? '⏳ PENDING' :
                          selectedOrder.status === 'in_progress' ? '🚚 IN PROGRESS' :
                            selectedOrder.status === 'delivered' ? '✅ DELIVERED' :
                              selectedOrder.status === 'cancelled' ? '❌ CANCELLED' :
                                selectedOrder.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-x-2">
                      {selectedOrder.status === 'pending' && (
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, 'in_progress');
                            setShowOrderModal(false);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                          🚚 Start Delivery
                        </button>
                      )}
                      {selectedOrder.status === 'in_progress' && (
                        <button
                          onClick={() => {
                            updateOrderStatus(selectedOrder.id, 'delivered');
                            setShowOrderModal(false);
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        >
                          ✅ Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">🕒 Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Created:</span>
                      <span className="text-gray-900">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    {selectedOrder.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="text-gray-900">{formatDate(selectedOrder.updatedAt)}</span>
                      </div>
                    )}
                    {selectedOrder.deliveredAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivered At:</span>
                        <span className="text-green-600 font-medium">{formatDate(selectedOrder.deliveredAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
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

export default DeliveryDashboard;



