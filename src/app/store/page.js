"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../stores/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import Loading from "@/components/Loading";

const StoreDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    activeProducts: 0,
    soldProducts: 0,
    totalViews: 0,
    totalInquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadStoreData();
    }
  }, [user]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's products
      const productsQuery = query(
        collection(db, "products"),
        where("createdBy", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(5) // Show recent 5 products on dashboard
      );

      const productsSnapshot = await getDocs(productsQuery);
      const userProducts = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setProducts(userProducts);

      // Calculate analytics
      const totalProducts = userProducts.length;
      const activeProducts = userProducts.filter(p => p.status === "active").length;
      const soldProducts = userProducts.filter(p => p.status === "sold").length;
      const totalViews = userProducts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
      const totalInquiries = userProducts.reduce((sum, p) => sum + (p.inquiryCount || 0), 0);

      setAnalytics({
        totalProducts,
        activeProducts,
        soldProducts,
        totalViews,
        totalInquiries,
      });

    } catch (err) {
      console.error("Error loading store data:", err);
      setError("Failed to load store data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading your store..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
        <button
          onClick={loadStoreData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome back, {user.displayName || user.email?.split('@')[0]}!
        </h2>
        <p className="text-gray-600">
          Here's an overview of your store performance and recent activity.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">📦</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.activeProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Sold</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.soldProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">👁️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalViews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">💬</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Inquiries</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalInquiries}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/sell"
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 text-center transition-colors"
          >
            <div className="text-2xl mb-2">➕</div>
            <div className="font-medium">Add New Product</div>
            <div className="text-sm opacity-90">List a new item for sale</div>
          </a>
          
          <a
            href="/store/products"
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 text-center transition-colors"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium">Manage Products</div>
            <div className="text-sm opacity-90">Edit, delete, or update listings</div>
          </a>
          
          <a
            href="/store/analytics"
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 text-center transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">View Analytics</div>
            <div className="text-sm opacity-90">Track performance and insights</div>
          </a>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Products</h3>
          <a
            href="/store/products"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All →
          </a>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📦</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No products yet</h4>
            <p className="text-gray-600 mb-4">Start by creating your first product listing</p>
            <a
              href="/sell"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create First Product
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    {product.imageUrls && product.imageUrls[0] ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-400">📷</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{product.title}</h4>
                    <p className="text-sm text-gray-600">${product.price}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' :
                    product.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status || 'active'}
                  </span>
                  <div className="text-sm text-gray-500">
                    {product.viewCount || 0} views
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDashboard;