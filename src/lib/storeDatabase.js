/**
 * Store Database Utilities
 * Functions for setting up database indexes and initial data for store management
 */

import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, writeBatch } from 'firebase/firestore';
import { createStoreAnalyticsModel, createSellerPoliciesModel } from '@/types/store';

/**
 * Initialize store management data for a new seller
 */
export const initializeSellerStore = async (sellerId, sellerEmail) => {
  try {
    const batch = writeBatch(db);

    // Initialize store analytics
    const analyticsRef = doc(db, 'storeAnalytics', sellerId);
    const initialAnalytics = createStoreAnalyticsModel({
      sellerId,
      totalProducts: 0,
      activeProducts: 0,
      soldProducts: 0,
      unavailableProducts: 0,
      draftProducts: 0,
      totalViews: 0,
      totalInquiries: 0,
      totalFavorites: 0,
      conversionRate: 0,
      averageViewsPerProduct: 0,
      topPerformingProducts: [],
      recentActivity: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    });
    batch.set(analyticsRef, initialAnalytics);

    // Initialize seller policies with defaults
    const policiesRef = doc(db, 'sellerPolicies', sellerId);
    const initialPolicies = createSellerPoliciesModel({
      sellerId,
      returnPolicy: {
        acceptsReturns: false,
        returnWindow: 0,
        returnConditions: '',
        returnShipping: 'buyer_pays'
      },
      shippingPolicy: {
        shippingMethods: ['pickup'],
        processingTime: '1-2 business days',
        shippingCost: 0,
        freeShippingThreshold: null
      },
      communicationPreferences: {
        autoRespond: false,
        responseTime: '24 hours',
        preferredContactMethod: 'platform',
        businessHours: null
      },
      generalPolicies: {
        paymentMethods: ['cash'],
        meetupLocations: ['campus'],
        additionalTerms: ''
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    batch.set(policiesRef, initialPolicies);

    await batch.commit();

    console.log(`Store initialized for seller: ${sellerId}`);
    return { success: true, sellerId };
  } catch (error) {
    console.error('Error initializing seller store:', error);
    throw new Error('Failed to initialize seller store');
  }
};

/**
 * Check if seller store is initialized
 */
export const isSellerStoreInitialized = async (sellerId) => {
  try {
    const analyticsRef = doc(db, 'storeAnalytics', sellerId);
    const analyticsDoc = await getDoc(analyticsRef);
    
    const policiesRef = doc(db, 'sellerPolicies', sellerId);
    const policiesDoc = await getDoc(policiesRef);

    return analyticsDoc.exists() && policiesDoc.exists();
  } catch (error) {
    console.error('Error checking seller store initialization:', error);
    return false;
  }
};

/**
 * Migrate existing products to include store management fields
 */
export const migrateProductsForStoreManagement = async (sellerId) => {
  try {
    const { getDocs, query, where, updateDoc } = await import('firebase/firestore');
    
    // Get all products for this seller
    const productsQuery = query(
      collection(db, 'products'),
      where('createdBy', '==', sellerId)
    );
    
    const productsSnapshot = await getDocs(productsQuery);
    const batch = writeBatch(db);
    let updateCount = 0;

    productsSnapshot.docs.forEach((docSnapshot) => {
      const productData = docSnapshot.data();
      const productRef = doc(db, 'products', docSnapshot.id);

      // Add missing store management fields
      const updates = {};
      
      if (productData.viewCount === undefined) updates.viewCount = 0;
      if (productData.inquiryCount === undefined) updates.inquiryCount = 0;
      if (productData.favoriteCount === undefined) updates.favoriteCount = 0;
      if (productData.shareCount === undefined) updates.shareCount = 0;
      if (productData.tags === undefined) updates.tags = [];
      if (productData.searchKeywords === undefined) {
        updates.searchKeywords = [
          ...(productData.title ? productData.title.toLowerCase().split(' ') : []),
          ...(productData.description ? productData.description.toLowerCase().split(' ') : []),
          ...(productData.category ? [productData.category.toLowerCase()] : [])
        ].filter(keyword => keyword && keyword.length > 2);
      }
      if (productData.isPromoted === undefined) updates.isPromoted = false;
      if (productData.quantity === undefined) updates.quantity = 1;
      if (productData.isUnlimited === undefined) updates.isUnlimited = false;
      if (productData.conversionRate === undefined) updates.conversionRate = 0;
      if (productData.isVerified === undefined) updates.isVerified = false;
      if (productData.moderationStatus === undefined) updates.moderationStatus = 'approved';
      if (productData.reportCount === undefined) updates.reportCount = 0;

      if (Object.keys(updates).length > 0) {
        batch.update(productRef, updates);
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Migrated ${updateCount} products for seller: ${sellerId}`);
    }

    return { success: true, updatedProducts: updateCount };
  } catch (error) {
    console.error('Error migrating products:', error);
    throw new Error('Failed to migrate products');
  }
};

/**
 * Create sample data for testing store management features
 */
export const createSampleStoreData = async (sellerId) => {
  try {
    const batch = writeBatch(db);

    // Create sample auto responses
    const autoResponses = [
      {
        name: 'Welcome Message',
        triggers: ['first_inquiry'],
        subject: 'Thanks for your interest!',
        content: 'Hi! Thanks for your interest in my product. I\'ll get back to you as soon as possible. Feel free to ask any questions!',
        isActive: true,
        delay: 0
      },
      {
        name: 'Price Inquiry Response',
        triggers: ['price_question'],
        subject: 'About the price',
        content: 'The price listed is firm, but I\'m open to reasonable offers. Let me know if you have any other questions!',
        isActive: false,
        delay: 5
      }
    ];

    autoResponses.forEach((response, index) => {
      const responseRef = doc(collection(db, 'autoResponses'));
      batch.set(responseRef, {
        ...response,
        sellerId,
        id: responseRef.id,
        timesUsed: 0,
        lastUsed: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    await batch.commit();

    console.log(`Created sample data for seller: ${sellerId}`);
    return { success: true };
  } catch (error) {
    console.error('Error creating sample data:', error);
    throw new Error('Failed to create sample data');
  }
};

/**
 * Clean up store data when a seller account is deleted
 */
export const cleanupSellerStoreData = async (sellerId) => {
  try {
    const batch = writeBatch(db);

    // Delete store analytics
    const analyticsRef = doc(db, 'storeAnalytics', sellerId);
    batch.delete(analyticsRef);

    // Delete seller policies
    const policiesRef = doc(db, 'sellerPolicies', sellerId);
    batch.delete(policiesRef);

    // Get and delete auto responses
    const { getDocs, query, where } = await import('firebase/firestore');
    const autoResponsesQuery = query(
      collection(db, 'autoResponses'),
      where('sellerId', '==', sellerId)
    );
    const autoResponsesSnapshot = await getDocs(autoResponsesQuery);
    autoResponsesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Get and delete activity logs
    const activityLogsQuery = query(
      collection(db, 'activityLogs'),
      where('sellerId', '==', sellerId)
    );
    const activityLogsSnapshot = await getDocs(activityLogsQuery);
    activityLogsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`Cleaned up store data for seller: ${sellerId}`);
    return { success: true };
  } catch (error) {
    console.error('Error cleaning up store data:', error);
    throw new Error('Failed to clean up store data');
  }
};

/**
 * Validate store data integrity
 */
export const validateStoreDataIntegrity = async (sellerId) => {
  try {
    const issues = [];

    // Check if analytics exist
    const analyticsRef = doc(db, 'storeAnalytics', sellerId);
    const analyticsDoc = await getDoc(analyticsRef);
    if (!analyticsDoc.exists()) {
      issues.push('Missing store analytics');
    }

    // Check if policies exist
    const policiesRef = doc(db, 'sellerPolicies', sellerId);
    const policiesDoc = await getDoc(policiesRef);
    if (!policiesDoc.exists()) {
      issues.push('Missing seller policies');
    }

    // Check product data consistency
    const { getDocs, query, where } = await import('firebase/firestore');
    const productsQuery = query(
      collection(db, 'products'),
      where('createdBy', '==', sellerId)
    );
    const productsSnapshot = await getDocs(productsQuery);
    
    let productsWithMissingFields = 0;
    productsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.viewCount === undefined || data.inquiryCount === undefined) {
        productsWithMissingFields++;
      }
    });

    if (productsWithMissingFields > 0) {
      issues.push(`${productsWithMissingFields} products missing analytics fields`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      totalProducts: productsSnapshot.docs.length
    };
  } catch (error) {
    console.error('Error validating store data integrity:', error);
    return {
      isValid: false,
      issues: ['Error during validation'],
      totalProducts: 0
    };
  }
};

/**
 * Get database collection references for store management
 */
export const getStoreCollections = () => ({
  products: collection(db, 'products'),
  storeAnalytics: collection(db, 'storeAnalytics'),
  inquiries: collection(db, 'inquiries'),
  messages: collection(db, 'messages'),
  activityLogs: collection(db, 'activityLogs'),
  autoResponses: collection(db, 'autoResponses'),
  sellerPolicies: collection(db, 'sellerPolicies'),
  productPerformance: collection(db, 'productPerformance')
});

/**
 * Recommended Firestore indexes for optimal performance
 * These should be created in the Firebase console or via Firebase CLI
 */
export const getRecommendedIndexes = () => [
  // Products collection indexes
  {
    collection: 'products',
    fields: [
      { field: 'createdBy', order: 'ASCENDING' },
      { field: 'status', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'products',
    fields: [
      { field: 'createdBy', order: 'ASCENDING' },
      { field: 'category', order: 'ASCENDING' },
      { field: 'createdAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'products',
    fields: [
      { field: 'createdBy', order: 'ASCENDING' },
      { field: 'viewCount', order: 'DESCENDING' }
    ]
  },
  
  // Activity logs indexes
  {
    collection: 'activityLogs',
    fields: [
      { field: 'sellerId', order: 'ASCENDING' },
      { field: 'timestamp', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'activityLogs',
    fields: [
      { field: 'sellerId', order: 'ASCENDING' },
      { field: 'activityType', order: 'ASCENDING' },
      { field: 'timestamp', order: 'DESCENDING' }
    ]
  },
  
  // Inquiries indexes
  {
    collection: 'inquiries',
    fields: [
      { field: 'sellerId', order: 'ASCENDING' },
      { field: 'status', order: 'ASCENDING' },
      { field: 'lastMessageAt', order: 'DESCENDING' }
    ]
  },
  {
    collection: 'inquiries',
    fields: [
      { field: 'buyerId', order: 'ASCENDING' },
      { field: 'lastMessageAt', order: 'DESCENDING' }
    ]
  },
  
  // Auto responses indexes
  {
    collection: 'autoResponses',
    fields: [
      { field: 'sellerId', order: 'ASCENDING' },
      { field: 'isActive', order: 'ASCENDING' }
    ]
  }
];

export default {
  initializeSellerStore,
  isSellerStoreInitialized,
  migrateProductsForStoreManagement,
  createSampleStoreData,
  cleanupSellerStoreData,
  validateStoreDataIntegrity,
  getStoreCollections,
  getRecommendedIndexes
};