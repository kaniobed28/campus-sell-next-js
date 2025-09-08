"use client";
import React, { useState } from "react";

const ProductPerformanceTable = ({ products, onProductClick }) => {
  const [sortBy, setSortBy] = useState("views");
  const [sortOrder, setSortOrder] = useState("desc");

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-600">No products to analyze</p>
          <p className="text-sm text-gray-500">Create some products to see performance data</p>
        </div>
      </div>
    );
  }

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[sortBy] || 0;
    const bValue = b[sortBy] || 0;
    
    if (sortOrder === "asc") {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const getPerformanceScore = (product) => {
    // Simple performance scoring algorithm
    const views = product.views || 0;
    const inquiries = product.inquiries || 0;
    const favorites = product.favorites || 0;
    
    let score = views * 1 + inquiries * 5 + favorites * 3;
    
    // Bonus for sold products
    if (product.status === "sold") {
      score += 50;
    }
    
    return Math.min(100, Math.round(score / 2));
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    if (score >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      case "unavailable":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
        <div className="text-sm text-gray-500">
          Showing {sortedProducts.length} products
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("views")}
              >
                Views {getSortIcon("views")}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("inquiries")}
              >
                Inquiries {getSortIcon("inquiries")}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("favorites")}
              >
                Favorites {getSortIcon("favorites")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("price")}
              >
                Price {getSortIcon("price")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProducts.map((product, index) => {
              const performanceScore = getPerformanceScore(product);
              return (
                <tr 
                  key={product.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onProductClick && onProductClick(product)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold text-xs">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {product.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="font-medium">{product.views || 0}</span>
                      {product.viewsChange && (
                        <span className={`ml-2 text-xs ${product.viewsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.viewsChange > 0 ? '+' : ''}{product.viewsChange}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="font-medium">{product.inquiries || 0}</span>
                      {product.inquiries > 0 && (
                        <span className="ml-2 text-xs text-blue-600">
                          {Math.round(((product.inquiries || 0) / (product.views || 1)) * 100)}% rate
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.favorites || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`px-2 py-1 text-xs font-medium rounded-full ${getPerformanceColor(performanceScore)}`}>
                        {performanceScore}/100
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status || "active")}`}>
                      {product.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(product.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Performance insights */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Performance Insights</h4>
        <div className="text-sm text-blue-800 space-y-1">
          {sortedProducts.filter(p => getPerformanceScore(p) >= 80).length > 0 && (
            <p>• {sortedProducts.filter(p => getPerformanceScore(p) >= 80).length} high-performing products</p>
          )}
          {sortedProducts.filter(p => (p.views || 0) > 0 && (p.inquiries || 0) === 0).length > 0 && (
            <p>• {sortedProducts.filter(p => (p.views || 0) > 0 && (p.inquiries || 0) === 0).length} products getting views but no inquiries</p>
          )}
          {sortedProducts.filter(p => (p.views || 0) === 0).length > 0 && (
            <p>• {sortedProducts.filter(p => (p.views || 0) === 0).length} products with no views yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPerformanceTable;