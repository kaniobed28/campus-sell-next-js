/**
 * Store Management Data Models and Types
 * These models extend the existing product structure with store management capabilities
 */

// Product Status Enum
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  SOLD: 'sold',
  UNAVAILABLE: 'unavailable',
  DRAFT: 'draft'
};

// Inquiry Status Enum
export const INQUIRY_STATUS = {
  OPEN: 'open',
  REPLIED: 'replied',
  COMPLETED: 'completed',
  CLOSED: 'closed'
};

// Activity Types for Analytics
export const ACTIVITY_TYPES = {
  PRODUCT_CREATED: 'product_created',
  PRODUCT_UPDATED: 'product_updated',
  PRODUCT_DELETED: 'product_deleted',
  PRODUCT_STATUS_CHANGED: 'product_status_changed',
  INQUIRY_RECEIVED: 'inquiry_received',
  INQUIRY_REPLIED: 'inquiry_replied',
  PRODUCT_VIEWED: 'product_viewed',
  PRODUCT_FAVORITED: 'product_favorited'
};

/**
 * Extended Product Model for Store Management
 * Extends the existing product structure with analytics and management fields
 */
export const createProductModel = (productData) => ({
  // Core product fields
  id: productData.id || '',
  title: productData.title || '',
  description: productData.description || '',
  price: productData.price || 0,
  category: productData.category || '',
  subcategory: productData.subcategory || null,
  images: productData.images || [],
  imageUrls: productData.imageUrls || [], // For backward compatibility
  status: productData.status || PRODUCT_STATUS.ACTIVE,
  tags: productData.tags || [],
  sellerId: productData.sellerId || productData.createdBy || '',
  createdAt: productData.createdAt || new Date(),
  updatedAt: productData.updatedAt || new Date(),
  
  // Analytics fields
  viewCount: productData.viewCount || 0,
  inquiryCount: productData.inquiryCount || 0,
  favoriteCount: productData.favoriteCount || 0,
  shareCount: productData.shareCount || 0,
  
  // Store management fields
  lastEditedAt: productData.lastEditedAt || null,
  isPromoted: productData.isPromoted || false,
  promotedUntil: productData.promotedUntil || null,
  
  // SEO and search optimization
  searchKeywords: productData.searchKeywords || [],
  slug: productData.slug || '',
  
  // Seller policies and automation
  autoResponses: productData.autoResponses || [],
  policies: productData.policies || null,
  
  // Inventory management
  quantity: productData.quantity || 1,
  isUnlimited: productData.isUnlimited || false,
  
  // Performance tracking
  conversionRate: productData.conversionRate || 0,
  averageResponseTime: productData.averageResponseTime || 0,
  
  // Validation and moderation
  isVerified: productData.isVerified || false,
  moderationStatus: productData.moderationStatus || 'pending',
  reportCount: productData.reportCount || 0
});

/**
 * Store Analytics Model
 * Tracks comprehensive performance metrics for a seller's store
 */
export const createStoreAnalyticsModel = (analyticsData) => ({
  sellerId: analyticsData.sellerId || '',
  
  // Product metrics
  totalProducts: analyticsData.totalProducts || 0,
  activeProducts: analyticsData.activeProducts || 0,
  soldProducts: analyticsData.soldProducts || 0,
  unavailableProducts: analyticsData.unavailableProducts || 0,
  draftProducts: analyticsData.draftProducts || 0,
  
  // Engagement metrics
  totalViews: analyticsData.totalViews || 0,
  totalInquiries: analyticsData.totalInquiries || 0,
  totalFavorites: analyticsData.totalFavorites || 0,
  totalShares: analyticsData.totalShares || 0,
  
  // Performance metrics
  conversionRate: analyticsData.conversionRate || 0,
  averageViewsPerProduct: analyticsData.averageViewsPerProduct || 0,
  averageResponseTime: analyticsData.averageResponseTime || 0,
  customerSatisfactionScore: analyticsData.customerSatisfactionScore || 0,
  
  // Revenue metrics
  totalRevenue: analyticsData.totalRevenue || 0,
  averageOrderValue: analyticsData.averageOrderValue || 0,
  monthlyRevenue: analyticsData.monthlyRevenue || [],
  
  // Top performing products
  topPerformingProducts: analyticsData.topPerformingProducts || [],
  
  // Recent activity
  recentActivity: analyticsData.recentActivity || [],
  
  // Time-based statistics
  dailyStats: analyticsData.dailyStats || [],
  weeklyStats: analyticsData.weeklyStats || [],
  monthlyStats: analyticsData.monthlyStats || [],
  
  // Timestamps
  lastUpdated: analyticsData.lastUpdated || new Date(),
  createdAt: analyticsData.createdAt || new Date()
});

/**
 * Inquiry Model
 * Manages buyer-seller communication
 */
export const createInquiryModel = (inquiryData) => ({
  id: inquiryData.id || '',
  productId: inquiryData.productId || '',
  buyerId: inquiryData.buyerId || '',
  sellerId: inquiryData.sellerId || '',
  subject: inquiryData.subject || '',
  status: inquiryData.status || INQUIRY_STATUS.OPEN,
  priority: inquiryData.priority || 'normal', // low, normal, high, urgent
  
  // Message thread
  messages: inquiryData.messages || [],
  
  // Metadata
  createdAt: inquiryData.createdAt || new Date(),
  updatedAt: inquiryData.updatedAt || new Date(),
  lastMessageAt: inquiryData.lastMessageAt || new Date(),
  
  // Response tracking
  sellerResponseTime: inquiryData.sellerResponseTime || null,
  buyerLastSeen: inquiryData.buyerLastSeen || null,
  sellerLastSeen: inquiryData.sellerLastSeen || null,
  
  // Automation
  autoResponseSent: inquiryData.autoResponseSent || false,
  remindersSent: inquiryData.remindersSent || 0,
  
  // Resolution
  resolvedAt: inquiryData.resolvedAt || null,
  resolutionType: inquiryData.resolutionType || null, // sale, no_sale, spam, other
  satisfactionRating: inquiryData.satisfactionRating || null
});

/**
 * Message Model
 * Individual messages within an inquiry
 */
export const createMessageModel = (messageData) => ({
  id: messageData.id || '',
  inquiryId: messageData.inquiryId || '',
  senderId: messageData.senderId || '',
  senderType: messageData.senderType || 'buyer', // buyer, seller, system
  content: messageData.content || '',
  messageType: messageData.messageType || 'text', // text, image, file, system
  
  // Timestamps
  timestamp: messageData.timestamp || new Date(),
  editedAt: messageData.editedAt || null,
  
  // Status
  isRead: messageData.isRead || false,
  readAt: messageData.readAt || null,
  
  // Attachments
  attachments: messageData.attachments || [],
  
  // Metadata
  isSystemMessage: messageData.isSystemMessage || false,
  isAutoResponse: messageData.isAutoResponse || false,
  parentMessageId: messageData.parentMessageId || null
});

/**
 * Activity Log Model
 * Tracks all store activities for analytics and history
 */
export const createActivityLogModel = (activityData) => ({
  id: activityData.id || '',
  sellerId: activityData.sellerId || '',
  activityType: activityData.activityType || '',
  
  // Related entities
  productId: activityData.productId || null,
  inquiryId: activityData.inquiryId || null,
  buyerId: activityData.buyerId || null,
  
  // Activity details
  description: activityData.description || '',
  metadata: activityData.metadata || {},
  
  // Timestamps
  timestamp: activityData.timestamp || new Date(),
  
  // Analytics
  impact: activityData.impact || 'neutral', // positive, negative, neutral
  value: activityData.value || 0 // numerical value for analytics
});

/**
 * Auto Response Model
 * Manages automated responses for inquiries
 */
export const createAutoResponseModel = (responseData) => ({
  id: responseData.id || '',
  sellerId: responseData.sellerId || '',
  name: responseData.name || '',
  
  // Trigger conditions
  triggers: responseData.triggers || [], // Array of trigger conditions
  
  // Response content
  subject: responseData.subject || '',
  content: responseData.content || '',
  
  // Settings
  isActive: responseData.isActive || false,
  delay: responseData.delay || 0, // Delay in minutes before sending
  
  // Usage tracking
  timesUsed: responseData.timesUsed || 0,
  lastUsed: responseData.lastUsed || null,
  
  // Timestamps
  createdAt: responseData.createdAt || new Date(),
  updatedAt: responseData.updatedAt || new Date()
});

/**
 * Seller Policies Model
 * Stores seller's policies and preferences
 */
export const createSellerPoliciesModel = (policiesData) => ({
  sellerId: policiesData.sellerId || '',
  
  // Return policy
  returnPolicy: {
    acceptsReturns: policiesData.returnPolicy?.acceptsReturns || false,
    returnWindow: policiesData.returnPolicy?.returnWindow || 0, // days
    returnConditions: policiesData.returnPolicy?.returnConditions || '',
    returnShipping: policiesData.returnPolicy?.returnShipping || 'buyer_pays'
  },
  
  // Shipping policy
  shippingPolicy: {
    shippingMethods: policiesData.shippingPolicy?.shippingMethods || [],
    processingTime: policiesData.shippingPolicy?.processingTime || '1-2 business days',
    shippingCost: policiesData.shippingPolicy?.shippingCost || 0,
    freeShippingThreshold: policiesData.shippingPolicy?.freeShippingThreshold || null
  },
  
  // Communication preferences
  communicationPreferences: {
    autoRespond: policiesData.communicationPreferences?.autoRespond || false,
    responseTime: policiesData.communicationPreferences?.responseTime || '24 hours',
    preferredContactMethod: policiesData.communicationPreferences?.preferredContactMethod || 'platform',
    businessHours: policiesData.communicationPreferences?.businessHours || null
  },
  
  // General policies
  generalPolicies: {
    paymentMethods: policiesData.generalPolicies?.paymentMethods || [],
    meetupLocations: policiesData.generalPolicies?.meetupLocations || [],
    additionalTerms: policiesData.generalPolicies?.additionalTerms || ''
  },
  
  // Timestamps
  createdAt: policiesData.createdAt || new Date(),
  updatedAt: policiesData.updatedAt || new Date()
});

/**
 * Product Performance Model
 * Detailed performance metrics for individual products
 */
export const createProductPerformanceModel = (performanceData) => ({
  productId: performanceData.productId || '',
  sellerId: performanceData.sellerId || '',
  
  // View metrics
  totalViews: performanceData.totalViews || 0,
  uniqueViews: performanceData.uniqueViews || 0,
  viewsToday: performanceData.viewsToday || 0,
  viewsThisWeek: performanceData.viewsThisWeek || 0,
  viewsThisMonth: performanceData.viewsThisMonth || 0,
  
  // Engagement metrics
  inquiries: performanceData.inquiries || 0,
  favorites: performanceData.favorites || 0,
  shares: performanceData.shares || 0,
  
  // Conversion metrics
  conversions: performanceData.conversions || 0,
  conversionRate: performanceData.conversionRate || 0,
  
  // Time-based data
  dailyViews: performanceData.dailyViews || [],
  hourlyViews: performanceData.hourlyViews || [],
  
  // Comparison metrics
  categoryRank: performanceData.categoryRank || null,
  priceCompetitiveness: performanceData.priceCompetitiveness || null,
  
  // Optimization suggestions
  suggestions: performanceData.suggestions || [],
  
  // Last updated
  lastUpdated: performanceData.lastUpdated || new Date()
});

// Export all models and enums
export {
  PRODUCT_STATUS,
  INQUIRY_STATUS,
  ACTIVITY_TYPES
};