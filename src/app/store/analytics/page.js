"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../stores/useAuth";
import Loading from "@/components/Loading";
import analyticsService from "./services/analyticsService";
import MetricCard from "./components/MetricCard";
import AnalyticsChart from "./components/AnalyticsChart";
import ProductPerformanceTable from "./components/ProductPerformanceTable";
import DateRangeSelector from "./components/DateRangeSelector";

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("30");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const analyticsData = await analyticsService.generateStoreAnalytics(user.uid, dateRange);
      setAnalytics(analyticsData);

    } catch (err) {
      console.error("Error loading analytics:", err);
      setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = "json") => {
    try {
      setExporting(true);
      const exportData = await analyticsService.exportAnalyticsData(user.uid, format, dateRange);
      
      // Create and download file
      const blob = new Blob([exportData], { 
        type: format === "csv" ? "text/csv" : "application/json" 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `store-analytics-${dateRange}days.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert(`Analytics data exported successfully as ${format.toUpperCase()}`);
    } catch (err) {
      console.error("Error exporting analytics:", err);
      alert("Failed to export analytics data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleProductClick = (product) => {
    // Navigate to product edit page
    window.location.href = `/store/products/edit/${product.id}`;
  };

  if (loading) {
    return <Loading message="Loading analytics..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-destructive text-xl mb-4">⚠️ {error}</div>
        <button
          onClick={loadAnalytics}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Store Analytics</h2>
          <p className="text-muted-foreground">Track your store's performance and insights</p>
        </div>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
          <DateRangeSelector
            value={dateRange}
            onChange={setDateRange}
            className="w-full md:w-48"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport("json")}
              disabled={exporting}
              className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {exporting ? "Exporting..." : "Export JSON"}
            </button>
            <button
              onClick={() => handleExport("csv")}
              disabled={exporting}
              className="px-3 py-2 text-sm bg-success text-success-foreground rounded-md hover:opacity-90 disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Products"
          value={analytics.totalProducts || 0}
          change={analytics.comparisons?.totalProducts?.change}
          changeType={analytics.comparisons?.totalProducts?.change > 0 ? "positive" : analytics.comparisons?.totalProducts?.change < 0 ? "negative" : "neutral"}
          icon="📦"
          color="blue"
          subtitle={`${analytics.activeProducts || 0} active`}
        />
        
        <MetricCard
          title="Total Views"
          value={analytics.totalViews || 0}
          change={analytics.comparisons?.totalViews?.change}
          changeType={analytics.comparisons?.totalViews?.change > 0 ? "positive" : analytics.comparisons?.totalViews?.change < 0 ? "negative" : "neutral"}
          icon="👁️"
          color="orange"
          subtitle={`${analytics.averageViewsPerProduct || 0} avg per product`}
        />
        
        <MetricCard
          title="Total Inquiries"
          value={analytics.totalInquiries || 0}
          change={analytics.comparisons?.totalInquiries?.change}
          changeType={analytics.comparisons?.totalInquiries?.change > 0 ? "positive" : analytics.comparisons?.totalInquiries?.change < 0 ? "negative" : "neutral"}
          icon="💬"
          color="green"
          subtitle={`${analytics.inquiryRate || 0}% inquiry rate`}
        />
        
        <MetricCard
          title="Products Sold"
          value={analytics.soldProducts || 0}
          change={analytics.comparisons?.soldProducts?.change}
          changeType={analytics.comparisons?.soldProducts?.change > 0 ? "positive" : analytics.comparisons?.soldProducts?.change < 0 ? "negative" : "neutral"}
          icon="💰"
          color="purple"
          subtitle={`${analytics.overallConversionRate || 0}% conversion rate`}
        />
      </div>

      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Store Health Score"
          value={`${analytics.storeHealthScore || 0}/100`}
          icon="💪"
          color={analytics.storeHealthScore >= 80 ? "green" : analytics.storeHealthScore >= 60 ? "yellow" : "red"}
          subtitle="Overall store performance"
        />
        
        <MetricCard
          title="Engagement Score"
          value={`${analytics.engagementScore || 0}/100`}
          icon="📈"
          color={analytics.engagementScore >= 80 ? "green" : analytics.engagementScore >= 60 ? "yellow" : "red"}
          subtitle="Buyer interaction quality"
        />
        
        <MetricCard
          title="Active Product Ratio"
          value={`${analytics.activeProductRatio || 0}%`}
          icon="🎯"
          color={analytics.activeProductRatio >= 80 ? "green" : analytics.activeProductRatio >= 60 ? "yellow" : "red"}
          subtitle="Products available for sale"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          data={analytics.timeSeriesData?.views || []}
          title="Views Over Time"
          color="#3B82F6"
        />
        
        <AnalyticsChart
          data={analytics.timeSeriesData?.inquiries || []}
          title="Inquiries Over Time"
          color="#10B981"
        />
      </div>

      {/* Performance Chart */}
      <AnalyticsChart
        data={analytics.timeSeriesData?.performance || []}
        title="Store Performance Score"
        color="#8B5CF6"
      />

      {/* Product Performance Table */}
      <ProductPerformanceTable
        products={analytics.topPerformingProducts || []}
        onProductClick={handleProductClick}
      />

      {/* Insights and Recommendations */}
      {analytics.insights && analytics.insights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">💡 Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.insights.map((insight, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 border ${
                  insight.type === "success" ? "bg-success/10 border-success" :
                  insight.type === "warning" ? "bg-warning/10 border-warning" :
                  insight.type === "info" ? "bg-info/10 border-info" :
                  "bg-muted border-border"
                }`}
              >
                <div className="flex items-start">
                  <span className="text-lg mr-3">{insight.icon}</span>
                  <div>
                    <h4 className={`font-medium ${
                      insight.type === "success" ? "text-success-foreground" :
                      insight.type === "warning" ? "text-warning-foreground" :
                      insight.type === "info" ? "text-info-foreground" :
                      "text-foreground"
                    }`}>
                      {insight.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      insight.type === "success" ? "text-success-foreground/80" :
                      insight.type === "warning" ? "text-warning-foreground/80" :
                      insight.type === "info" ? "text-info-foreground/80" :
                      "text-muted-foreground"
                    }`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-card rounded-lg shadow p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/sell"
            className="bg-primary text-primary-foreground p-4 rounded-lg hover:opacity-90 text-center transition-colors"
          >
            <div className="text-2xl mb-2">➕</div>
            <div className="font-medium">Add New Product</div>
            <div className="text-sm opacity-90">Create a new listing</div>
          </a>
          
          <a
            href="/store/products"
            className="bg-success text-success-foreground p-4 rounded-lg hover:opacity-90 text-center transition-colors"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium">Manage Products</div>
            <div className="text-sm opacity-90">Edit existing listings</div>
          </a>
          
          <button
            onClick={() => handleExport("csv")}
            className="bg-accent text-accent-foreground p-4 rounded-lg hover:opacity-90 text-center transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Export Data</div>
            <div className="text-sm opacity-90">Download analytics</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;