/**
 * Policy and Auto-Response Service
 * Handles seller policies, auto-responses, and automation rules
 */

import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

import {
  createSellerPoliciesModel,
  createAutoResponseModel
} from '@/types/store';

class PolicyService {
  constructor() {
    this.collections = {
      sellerPolicies: 'sellerPolicies',
      autoResponses: 'autoResponses',
      notifications: 'notificationSettings'
    };
  }

  // ==================== SELLER POLICIES ====================

  /**
   * Get seller policies
   */
  async getSellerPolicies(sellerId) {
    try {
      const policiesRef = doc(db, this.collections.sellerPolicies, sellerId);
      const policiesDoc = await getDoc(policiesRef);

      if (policiesDoc.exists()) {
        return createSellerPoliciesModel({ id: policiesDoc.id, ...policiesDoc.data() });
      }

      // Return default policies if none exist
      return createSellerPoliciesModel({ sellerId });
    } catch (error) {
      console.error('Error fetching seller policies:', error);
      throw new Error('Failed to fetch seller policies');
    }
  }

  /**
   * Update seller policies
   */
  async updateSellerPolicies(sellerId, policies) {
    try {
      const policiesData = createSellerPoliciesModel({
        ...policies,
        sellerId,
        updatedAt: serverTimestamp()
      });

      const policiesRef = doc(db, this.collections.sellerPolicies, sellerId);
      await setDoc(policiesRef, policiesData, { merge: true });

      return { success: true };
    } catch (error) {
      console.error('Error updating seller policies:', error);
      throw new Error('Failed to update seller policies');
    }
  }

  /**
   * Get policies for display on product pages
   */
  async getPoliciesForDisplay(sellerId) {
    try {
      const policies = await this.getSellerPolicies(sellerId);
      
      // Format policies for public display
      const displayPolicies = {
        returns: null,
        shipping: null,
        payment: null,
        communication: null
      };

      if (policies.returnPolicy?.acceptsReturns) {
        displayPolicies.returns = {
          accepted: true,
          window: policies.returnPolicy.returnWindow,
          conditions: policies.returnPolicy.returnConditions,
          shipping: policies.returnPolicy.returnShipping
        };
      }

      if (policies.shippingPolicy?.shippingMethods?.length > 0) {
        displayPolicies.shipping = {
          methods: policies.shippingPolicy.shippingMethods,
          processingTime: policies.shippingPolicy.processingTime,
          cost: policies.shippingPolicy.shippingCost,
          freeThreshold: policies.shippingPolicy.freeShippingThreshold
        };
      }

      if (policies.generalPolicies?.paymentMethods?.length > 0) {
        displayPolicies.payment = {
          methods: policies.generalPolicies.paymentMethods,
          meetupLocations: policies.generalPolicies.meetupLocations
        };
      }

      if (policies.communicationPreferences) {
        displayPolicies.communication = {
          responseTime: policies.communicationPreferences.responseTime,
          preferredMethod: policies.communicationPreferences.preferredContactMethod,
          businessHours: policies.communicationPreferences.businessHours
        };
      }

      return displayPolicies;
    } catch (error) {
      console.error('Error getting policies for display:', error);
      return null;
    }
  }

  // ==================== AUTO-RESPONSES ====================

  /**
   * Get all auto-responses for a seller
   */
  async getAutoResponses(sellerId) {
    try {
      const responsesQuery = query(
        collection(db, this.collections.autoResponses),
        where('sellerId', '==', sellerId)
      );

      const snapshot = await getDocs(responsesQuery);
      const responses = snapshot.docs.map(doc => 
        createAutoResponseModel({ id: doc.id, ...doc.data() })
      );

      return responses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching auto-responses:', error);
      throw new Error('Failed to fetch auto-responses');
    }
  }

  /**
   * Create or update auto-response
   */
  async saveAutoResponse(sellerId, responseData) {
    try {
      const autoResponseData = createAutoResponseModel({
        ...responseData,
        sellerId,
        updatedAt: serverTimestamp(),
        ...(responseData.id ? {} : { createdAt: serverTimestamp() })
      });

      if (responseData.id) {
        // Update existing response
        const responseRef = doc(db, this.collections.autoResponses, responseData.id);
        await updateDoc(responseRef, autoResponseData);
        return { success: true, id: responseData.id };
      } else {
        // Create new response
        const responseRef = doc(collection(db, this.collections.autoResponses));
        await setDoc(responseRef, autoResponseData);
        return { success: true, id: responseRef.id };
      }
    } catch (error) {
      console.error('Error saving auto-response:', error);
      throw new Error('Failed to save auto-response');
    }
  }

  /**
   * Delete auto-response
   */
  async deleteAutoResponse(responseId, sellerId) {
    try {
      const responseRef = doc(db, this.collections.autoResponses, responseId);
      const responseDoc = await getDoc(responseRef);

      if (!responseDoc.exists()) {
        throw new Error('Auto-response not found');
      }

      const responseData = responseDoc.data();
      if (responseData.sellerId !== sellerId) {
        throw new Error('Unauthorized: You can only delete your own auto-responses');
      }

      await deleteDoc(responseRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting auto-response:', error);
      throw error;
    }
  }

  /**
   * Get matching auto-responses for a trigger
   */
  async getMatchingAutoResponses(sellerId, trigger, context = {}) {
    try {
      const responses = await this.getAutoResponses(sellerId);
      
      // Filter active responses that match the trigger
      const matchingResponses = responses.filter(response => 
        response.isActive && 
        response.triggers.includes(trigger)
      );

      // Sort by priority (you could add priority field to auto-responses)
      return matchingResponses.sort((a, b) => (a.delay || 0) - (b.delay || 0));
    } catch (error) {
      console.error('Error getting matching auto-responses:', error);
      return [];
    }
  }

  /**
   * Process auto-response (replace variables, etc.)
   */
  processAutoResponseContent(content, context = {}) {
    let processedContent = content;

    // Replace common variables
    const variables = {
      '{buyer_name}': context.buyerName || 'there',
      '{product_title}': context.productTitle || 'this item',
      '{seller_name}': context.sellerName || 'I',
      '{price}': context.price ? `$${context.price}` : '',
      '{meetup_locations}': context.meetupLocations?.join(', ') || 'on campus',
      '{payment_methods}': context.paymentMethods?.join(', ') || 'cash or Venmo',
      '{response_time}': context.responseTime || '24 hours'
    };

    Object.entries(variables).forEach(([variable, value]) => {
      processedContent = processedContent.replace(new RegExp(variable, 'g'), value);
    });

    return processedContent;
  }

  /**
   * Track auto-response usage
   */
  async trackAutoResponseUsage(responseId) {
    try {
      const responseRef = doc(db, this.collections.autoResponses, responseId);
      await updateDoc(responseRef, {
        timesUsed: increment(1),
        lastUsed: serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking auto-response usage:', error);
      // Don't throw error as this is a background operation
    }
  }

  // ==================== AUTOMATION RULES ====================

  /**
   * Check if auto-response should be triggered
   */
  async shouldTriggerAutoResponse(sellerId, trigger, context = {}) {
    try {
      // Get seller's communication preferences
      const policies = await this.getSellerPolicies(sellerId);
      
      if (!policies.communicationPreferences?.autoRespond) {
        return false;
      }

      // Check business hours if enabled
      if (policies.communicationPreferences?.businessHours?.enabled) {
        const now = new Date();
        const currentHour = now.getHours();
        const startHour = parseInt(policies.communicationPreferences.businessHours.start.split(':')[0]);
        const endHour = parseInt(policies.communicationPreferences.businessHours.end.split(':')[0]);

        // If outside business hours, don't auto-respond (unless it's an urgent trigger)
        if ((currentHour < startHour || currentHour >= endHour) && trigger !== 'urgent_inquiry') {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking auto-response trigger:', error);
      return false;
    }
  }

  /**
   * Generate policy summary for product listings
   */
  generatePolicySummary(policies) {
    const summary = [];

    if (policies.returnPolicy?.acceptsReturns) {
      summary.push(`Returns accepted within ${policies.returnPolicy.returnWindow} days`);
    }

    if (policies.shippingPolicy?.shippingMethods?.length > 0) {
      summary.push(`Shipping: ${policies.shippingPolicy.shippingMethods.join(', ')}`);
    }

    if (policies.generalPolicies?.paymentMethods?.length > 0) {
      summary.push(`Payment: ${policies.generalPolicies.paymentMethods.join(', ')}`);
    }

    if (policies.communicationPreferences?.responseTime) {
      summary.push(`Response time: ${policies.communicationPreferences.responseTime}`);
    }

    return summary;
  }

  // ==================== NOTIFICATION SETTINGS ====================

  /**
   * Get notification settings
   */
  async getNotificationSettings(sellerId) {
    try {
      const settingsRef = doc(db, this.collections.notifications, sellerId);
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        return settingsDoc.data();
      }

      // Return default settings
      return {
        emailNotifications: true,
        pushNotifications: true,
        inquiryNotifications: true,
        saleNotifications: true,
        marketingEmails: false,
        weeklyReports: true,
        quietHours: {
          enabled: false,
          start: "22:00",
          end: "08:00"
        }
      };
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw new Error('Failed to fetch notification settings');
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(sellerId, settings) {
    try {
      const settingsRef = doc(db, this.collections.notifications, sellerId);
      await setDoc(settingsRef, {
        ...settings,
        sellerId,
        updatedAt: serverTimestamp()
      }, { merge: true });

      return { success: true };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw new Error('Failed to update notification settings');
    }
  }
}

// Create and export singleton instance
const policyService = new PolicyService();
export default policyService;