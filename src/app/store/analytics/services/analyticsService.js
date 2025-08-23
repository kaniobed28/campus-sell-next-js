/**
 * Analytics Service for Store Management
 * Generates comprehensive analytics data and insights
 */

import storeManagementService from "@/services/storeManagementService";

class AnalyticsService {
  /**
   * Generate comprehensive analytics for a seller
   */
  async generateStoreAnalytics(sellerId, dateRange = "30") {
    try {
      // Get base analytics from store management service
      const baseAnalytics = await storeManagementService.getStoreAnalytics(sellerId);
      
      // Generate time-series data
      const timeSeriesData = this.generateTimeSeriesData(baseAnalytics, dateRange);
      
      // Calculate advanced metrics
      const advancedMetrics = this.calculateAdvancedMetrics(baseAnalytics);
      
      // Generate insights and recommendations
      const insights = this.generateInsights(baseAnalytics, advancedMetrics);
      
      // Calculate performance comparisons
      const comparisons = this.calculatePeriodComparisons(baseAnalytics, dateRange);

      return {
        ...baseAnalytics,
        ...advancedMetrics,
        timeSeriesData,
        insights,
        comparisons,
        dateRange,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error("Error generating store analytics:", error);
      throw new Error("Failed to generate analytics");
    }
  }

  /**
   * Generate time-series data for charts
   */
  generateTimeSeriesData(analytics, dateRange) {
    const days = parseInt(dateRange) || 30;
    const data = {
      views: [],
      inquiries: [],
      products: [],
      performance: []
    };

    // Generate mock time-series data
    // In a real implementation, this would query historical data
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = i === 0 ? "Today" : i === 1 ? "Yesterday" : date.toLocaleDateString();

      // Generate realistic mock data with some randomness
      const baseViews = Math.max(0, Math.floor((analytics.totalViews || 0) / days + (Math.random() - 0.5) * 10));
      const baseInquiries = Math.max(0, Math.floor((analytics.totalInquiries || 0) / days + (Math.random() - 0.5) * 2));
      const baseProducts = analytics.totalProducts || 0;

      data.views.push({
        label: label,
        value: baseViews,
        date: date.toISOString().split('T')[0]
      });

      data.inquiries.push({
        label: label,
        value: baseInquiries,
        date: date.toISOString().split('T')[0]
      });

      data.products.push({
        label: label,
        value: baseProducts,
        date: date.toISOString().split('T')[0]
      });

      // Performance score (0-100)
      const performanceScore = Math.min(100, Math.max(0, 
        (baseViews * 2 + baseInquiries * 10 + (baseProducts > 0 ? 20 : 0)) + (Math.random() - 0.5) * 20
      ));

      data.performance.push({
        label: label,
        value: Math.round(performanceScore),
        date: date.toISOString().split('T')[0]
      });
    }

    return data;
  }

  /**
   * Calculate advanced metrics
   */
  calculateAdvancedMetrics(analytics) {
    const totalProducts = analytics.totalProducts || 0;
    const totalViews = analytics.totalViews || 0;
    const totalInquiries = analytics.totalInquiries || 0;
    const soldProducts = analytics.soldProducts || 0;

    // Engagement metrics
    const inquiryRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;
    const salesConversionRate = totalInquiries > 0 ? (soldProducts / totalInquiries) * 100 : 0;
    const overallConversionRate = totalViews > 0 ? (soldProducts / totalViews) * 100 : 0;

    // Product performance metrics
    const averageViewsPerProduct = totalProducts > 0 ? totalViews / totalProducts : 0;
    const averageInquiriesPerProduct = totalProducts > 0 ? totalInquiries / totalProducts : 0;

    // Quality metrics
    const activeProductRatio = totalProducts > 0 ? (analytics.activeProducts / totalProducts) * 100 : 0;
    const soldProductRatio = totalProducts > 0 ? (soldProducts / totalProducts) * 100 : 0;

    // Performance categories
    const highPerformingProducts = analytics.topPerformingProducts?.filter(p => p.views > averageViewsPerProduct * 1.5).length || 0;
    const lowPerformingProducts = analytics.topPerformingProducts?.filter(p => p.views < averageViewsPerProduct * 0.5).length || 0;

    return {
      inquiryRate: Math.round(inquiryRate * 100) / 100,
      salesConversionRate: Math.round(salesConversionRate * 100) / 100,
      overallConversionRate: Math.round(overallConversionRate * 100) / 100,
      averageViewsPerProduct: Math.round(averageViewsPerProduct * 100) / 100,
      averageInquiriesPerProduct: Math.round(averageInquiriesPerProduct * 100) / 100,
      activeProductRatio: Math.round(activeProductRatio * 100) / 100,
      soldProductRatio: Math.round(soldProductRatio * 100) / 100,
      highPerformingProducts,
      lowPerformingProducts,
      engagementScore: Math.min(100, Math.round((inquiryRate * 2 + salesConversionRate) / 3)),
      storeHealthScore: Math.min(100, Math.round((activeProductRatio + soldProductRatio + inquiryRate * 10) / 3))
    };
  }

  /**
   * Generate insights and recommendations
   */
  generateInsights(analytics, advancedMetrics) {
    const insights = [];

    // Performance insights
    if (advancedMetrics.overallConversionRate > 5) {
      insights.push({
        type: "success",
        icon: "🎉",
        title: "Great Conversion Rate",
        message: `Your ${advancedMetrics.overallConversionRate}% conversion rate is above average!`,
        priority: "high"
      });
    } else if (advancedMetrics.overallConversionRate < 1 && analytics.totalViews > 50) {
      insights.push({
        type: "warning",
        icon: "📈",
        title: "Low Conversion Rate",
        message: "Consider improving product descriptions, images, or pricing to increase sales.",
        priority: "high"
      });
    }

    // Engagement insights
    if (advancedMetrics.inquiryRate < 2 && analytics.totalViews > 20) {
      insights.push({
        type: "info",
        icon: "💬",
        title: "Low Inquiry Rate",
        message: "Add more detailed descriptions or encourage buyers to ask questions.",
        priority: "medium"
      });
    }

    // Product portfolio insights
    if (advancedMetrics.activeProductRatio < 50) {
      insights.push({
        type: "warning",
        icon: "📦",
        title: "Few Active Products",
        message: "Consider reactivating unavailable products or creating new listings.",
        priority: "medium"
      });
    }

    // Performance distribution insights
    if (advancedMetrics.highPerformingProducts > 0) {
      insights.push({
        type: "success",
        icon: "⭐",
        title: "High Performers Identified",
        message: `You have ${advancedMetrics.highPerformingProducts} high-performing products. Consider creating similar listings.`,
        priority: "low"
      });
    }

    if (advancedMetrics.lowPerformingProducts > 2) {
      insights.push({
        type: "info",
        icon: "🔧",
        title: "Optimization Opportunity",
        message: `${advancedMetrics.lowPerformingProducts} products need attention. Try updating images or descriptions.`,
        priority: "medium"
      });
    }

    // Store health insights
    if (advancedMetrics.storeHealthScore > 80) {
      insights.push({
        type: "success",
        icon: "💪",
        title: "Healthy Store",
        message: "Your store is performing well across all metrics!",
        priority: "low"
      });
    } else if (advancedMetrics.storeHealthScore < 40) {
      insights.push({
        type: "warning",
        icon: "🏥",
        title: "Store Needs Attention",
        message: "Focus on creating active listings and engaging with buyers.",
        priority: "high"
      });
    }

    // No data insights
    if (analytics.totalProducts === 0) {
      insights.push({
        type: "info",
        icon: "🚀",
        title: "Get Started",
        message: "Create your first product listing to start tracking analytics!",
        priority: "high"
      });
    } else if (analytics.totalViews === 0) {
      insights.push({
        type: "info",
        icon: "👀",
        title: "Increase Visibility",
        message: "Share your listings on social media or improve SEO to get more views.",
        priority: "high"
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate period-over-period comparisons
   */
  calculatePeriodComparisons(analytics, dateRange) {
    // Mock comparison data
    // In a real implementation, this would compare with previous periods
    const days = parseInt(dateRange) || 30;
    
    // Generate realistic comparison percentages
    const generateChange = (current, volatility = 0.3) => {
      if (current === 0) return 0;
      return Math.round((Math.random() - 0.5) * volatility * 200);
    };

    return {
      totalProducts: {
        current: analytics.totalProducts || 0,
        change: generateChange(analytics.totalProducts, 0.1),
        changeType: "neutral"
      },
      totalViews: {
        current: analytics.totalViews || 0,
        change: generateChange(analytics.totalViews, 0.4),
        changeType: "positive"
      },
      totalInquiries: {
        current: analytics.totalInquiries || 0,
        change: generateChange(analytics.totalInquiries, 0.5),
        changeType: "positive"
      },
      soldProducts: {
        current: analytics.soldProducts || 0,
        change: generateChange(analytics.soldProducts, 0.6),
        changeType: "positive"
      }
    };
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(sellerId, format = "json", dateRange = "30") {
    try {
      const analytics = await this.generateStoreAnalytics(sellerId, dateRange);
      
      if (format === "csv") {
        return this.convertToCSV(analytics);
      }
      
      return JSON.stringify(analytics, null, 2);
    } catch (error) {
      console.error("Error exporting analytics data:", error);
      throw new Error("Failed to export analytics data");
    }
  }

  /**
   * Convert analytics data to CSV format
   */
  convertToCSV(analytics) {
    const csvData = [];
    
    // Add summary metrics
    csvData.push("Metric,Value");
    csvData.push(`Total Products,${analytics.totalProducts}`);
    csvData.push(`Active Products,${analytics.activeProducts}`);
    csvData.push(`Sold Products,${analytics.soldProducts}`);
    csvData.push(`Total Views,${analytics.totalViews}`);
    csvData.push(`Total Inquiries,${analytics.totalInquiries}`);
    csvData.push(`Conversion Rate,${analytics.overallConversionRate}%`);
    csvData.push("");
    
    // Add top performing products
    csvData.push("Top Performing Products");
    csvData.push("Rank,Title,Views,Inquiries,Price,Status");
    analytics.topPerformingProducts?.forEach((product, index) => {
      csvData.push(`${index + 1},"${product.title}",${product.views},${product.inquiries},${product.price},${product.status}`);
    });
    
    return csvData.join("\n");
  }
}

// Create and export singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;