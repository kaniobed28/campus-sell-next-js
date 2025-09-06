"use client";

import { deliveryCompanyService } from './deliveryCompanyService';
import { BasketService } from './basketService';

/**
 * Service class for checkout operations
 * Integrates with delivery company service to show only active, admin-approved companies
 */
export class CheckoutService {
  /**
   * Get active delivery companies for checkout
   * Only returns companies with 'active' status
   */
  static async getActiveDeliveryCompanies() {
    try {
      const activeCompanies = await deliveryCompanyService.getCompaniesByStatus('active');
      return activeCompanies;
    } catch (error) {
      console.error("Error fetching active delivery companies:", error);
      throw new Error("Failed to load delivery companies. Please try again.");
    }
  }

  /**
   * Validate delivery company selection
   * Ensures the selected company is active and exists
   */
  static async validateDeliveryCompany(companyId) {
    try {
      const company = await deliveryCompanyService.getCompanyById(companyId);
      
      if (!company) {
        throw new Error("Selected delivery company not found");
      }
      
      if (company.status !== 'active') {
        throw new Error("Selected delivery company is not available");
      }
      
      return company;
    } catch (error) {
      console.error("Error validating delivery company:", error);
      throw error;
    }
  }

  /**
   * Process checkout with delivery company selection
   */
  static async processCheckout(userId, deliveryCompanyId, paymentInfo, additionalInfo = {}) {
    try {
      // 1. Validate delivery company
      const deliveryCompany = await this.validateDeliveryCompany(deliveryCompanyId);
      
      // 2. Get user's basket
      const basketItems = await BasketService.getUserBasket(userId);
      
      if (!basketItems || basketItems.length === 0) {
        throw new Error("Cannot checkout with empty basket");
      }
      
      // 3. Calculate total (in a real implementation, this would include delivery fees)
      const subtotal = basketItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryFee = deliveryCompany.pricing?.baseRates?.standard || 0;
      const total = subtotal + deliveryFee;
      
      // 4. Process payment (placeholder - in real implementation, integrate with payment provider)
      const paymentResult = await this.processPayment(paymentInfo, total);
      
      if (!paymentResult.success) {
        throw new Error("Payment processing failed");
      }
      
      // 5. Create order (placeholder - in real implementation, save to database)
      const order = await this.createOrder({
        userId,
        basketItems,
        deliveryCompanyId,
        deliveryCompany,
        subtotal,
        deliveryFee,
        total,
        paymentInfo: {
          transactionId: paymentResult.transactionId,
          paymentMethod: paymentInfo.method
        },
        ...additionalInfo
      });
      
      // 6. Clear user's basket after successful checkout
      await BasketService.clearUserBasket(userId);
      
      return {
        success: true,
        order,
        deliveryCompany
      };
    } catch (error) {
      console.error("Error processing checkout:", error);
      throw error;
    }
  }

  /**
   * Process payment (placeholder implementation)
   */
  static async processPayment(paymentInfo, amount) {
    // In a real implementation, this would integrate with a payment provider like Stripe
    // This is a placeholder that simulates payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          amount
        });
      }, 1000);
    });
  }

  /**
   * Create order (placeholder implementation)
   */
  static async createOrder(orderData) {
    // In a real implementation, this would save the order to the database
    // This is a placeholder that simulates order creation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          ...orderData,
          status: 'pending',
          createdAt: new Date().toISOString(),
          estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        });
      }, 500);
    });
  }

  /**
   * Handle case when no active delivery companies are available
   */
  static async handleNoActiveCompanies() {
    // This could be extended to notify admins or handle the situation differently
    throw new Error("No delivery companies are currently available. Please try again later.");
  }

  /**
   * Get delivery company options with pricing information
   */
  static async getDeliveryOptions(deliveryAddress) {
    try {
      // Get active companies
      const activeCompanies = await this.getActiveDeliveryCompanies();
      
      if (activeCompanies.length === 0) {
        return [];
      }
      
      // Enhance companies with pricing and estimated delivery times
      const enhancedCompanies = await Promise.all(
        activeCompanies.map(async (company) => {
          try {
            // Get pricing for this company
            const pricing = await deliveryCompanyService.getCompanyPricing(company.id);
            
            // In a real implementation, this would calculate based on address and company service areas
            const deliveryRate = pricing?.baseRates?.standard || 0;
            const estimatedTime = "24-48 hours"; // Placeholder
            
            return {
              ...company,
              deliveryRate,
              estimatedTime,
              pricing
            };
          } catch (error) {
            console.warn(`Error getting pricing for company ${company.id}:`, error);
            // Return company with default values if pricing fails
            return {
              ...company,
              deliveryRate: 0,
              estimatedTime: "24-48 hours",
              pricing: null
            };
          }
        })
      );
      
      // Sort by delivery rate (cheapest first)
      return enhancedCompanies.sort((a, b) => a.deliveryRate - b.deliveryRate);
    } catch (error) {
      console.error("Error getting delivery options:", error);
      throw error;
    }
  }
}

export default CheckoutService;