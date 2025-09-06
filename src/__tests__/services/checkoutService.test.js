/**
 * @jest-environment jsdom
 */

import { CheckoutService } from '../../services/checkoutService';

// Mock the delivery company service
jest.mock('../../services/deliveryCompanyService', () => ({
  deliveryCompanyService: {
    getCompaniesByStatus: jest.fn(),
    getCompanyById: jest.fn(),
    getCompanyPricing: jest.fn()
  }
}));

// Mock the basket service
jest.mock('../../services/basketService', () => ({
  BasketService: {
    getUserBasket: jest.fn(),
    clearUserBasket: jest.fn()
  }
}));

describe('CheckoutService', () => {
  const mockUserId = 'user123';
  const mockDeliveryCompanyId = 'company456';
  
  const mockActiveCompanies = [
    {
      id: '1',
      name: 'Active Company 1',
      status: 'active'
    },
    {
      id: '2',
      name: 'Active Company 2',
      status: 'active'
    }
  ];
  
  const mockInactiveCompany = {
    id: '3',
    name: 'Inactive Company',
    status: 'suspended'
  };
  
  const mockBasketItems = [
    {
      id: 'item1',
      productId: 'product1',
      quantity: 2,
      price: 10.99
    },
    {
      id: 'item2',
      productId: 'product2',
      quantity: 1,
      price: 25.50
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveDeliveryCompanies', () => {
    it('should return active delivery companies', async () => {
      require('../../services/deliveryCompanyService').deliveryCompanyService.getCompaniesByStatus.mockResolvedValue(mockActiveCompanies);
      
      const result = await CheckoutService.getActiveDeliveryCompanies();
      
      expect(result).toEqual(mockActiveCompanies);
      expect(require('../../services/deliveryCompanyService').deliveryCompanyService.getCompaniesByStatus).toHaveBeenCalledWith('active');
    });

    it('should handle errors when fetching delivery companies', async () => {
      require('../../services/deliveryCompanyService').deliveryCompanyService.getCompaniesByStatus.mockRejectedValue(new Error('Database error'));
      
      await expect(CheckoutService.getActiveDeliveryCompanies()).rejects.toThrow('Failed to load delivery companies. Please try again.');
    });
  });

  describe('validateDeliveryCompany', () => {
    it('should validate an active delivery company', async () => {
      const mockCompany = { id: mockDeliveryCompanyId, name: 'Test Company', status: 'active' };
      require('../../services/deliveryCompanyService').deliveryCompanyService.getCompanyById.mockResolvedValue(mockCompany);
      
      const result = await CheckoutService.validateDeliveryCompany(mockDeliveryCompanyId);
      
      expect(result).toEqual(mockCompany);
    });

    it('should throw error for non-existent company', async () => {
      require('../../services/deliveryCompanyService').deliveryCompanyService.getCompanyById.mockResolvedValue(null);
      
      await expect(CheckoutService.validateDeliveryCompany(mockDeliveryCompanyId)).rejects.toThrow('Selected delivery company not found');
    });

    it('should throw error for inactive company', async () => {
      require('../../services/deliveryCompanyService').deliveryCompanyService.getCompanyById.mockResolvedValue(mockInactiveCompany);
      
      await expect(CheckoutService.validateDeliveryCompany(mockDeliveryCompanyId)).rejects.toThrow('Selected delivery company is not available');
    });
  });

  describe('processCheckout', () => {
    it('should process checkout successfully', async () => {
      const mockCompany = { id: mockDeliveryCompanyId, name: 'Test Company', status: 'active' };
      const mockPaymentInfo = { method: 'card', cardNumber: '1234' };
      
      // Mock service responses
      require('../../services/deliveryCompanyService').deliveryCompanyService.getCompanyById.mockResolvedValue(mockCompany);
      require('../../services/basketService').BasketService.getUserBasket.mockResolvedValue(mockBasketItems);
      
      // Mock internal methods
      CheckoutService.processPayment = jest.fn().mockResolvedValue({ success: true, transactionId: 'txn123' });
      CheckoutService.createOrder = jest.fn().mockResolvedValue({ id: 'order123', status: 'pending' });
      
      const result = await CheckoutService.processCheckout(mockUserId, mockDeliveryCompanyId, mockPaymentInfo);
      
      expect(result.success).toBe(true);
      expect(result.order).toEqual({ id: 'order123', status: 'pending' });
      expect(result.deliveryCompany).toEqual(mockCompany);
      expect(require('../../services/basketService').BasketService.clearUserBasket).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw error for empty basket', async () => {
      const mockCompany = { id: mockDeliveryCompanyId, name: 'Test Company', status: 'active' };
      const mockPaymentInfo = { method: 'card' };
      
      require('../../services/deliveryCompanyService').deliveryCompanyService.getCompanyById.mockResolvedValue(mockCompany);
      require('../../services/basketService').BasketService.getUserBasket.mockResolvedValue([]);
      
      await expect(CheckoutService.processCheckout(mockUserId, mockDeliveryCompanyId, mockPaymentInfo)).rejects.toThrow('Cannot checkout with empty basket');
    });

    it('should handle payment processing failure', async () => {
      const mockCompany = { id: mockDeliveryCompanyId, name: 'Test Company', status: 'active' };
      const mockPaymentInfo = { method: 'card' };
      
      require('../../services/deliveryCompanyService').deliveryCompanyService.getCompanyById.mockResolvedValue(mockCompany);
      require('../../services/basketService').BasketService.getUserBasket.mockResolvedValue(mockBasketItems);
      CheckoutService.processPayment = jest.fn().mockResolvedValue({ success: false });
      
      await expect(CheckoutService.processCheckout(mockUserId, mockDeliveryCompanyId, mockPaymentInfo)).rejects.toThrow('Payment processing failed');
    });
  });

  describe('getDeliveryOptions', () => {
    it('should return delivery options with pricing', async () => {
      const mockCompaniesWithPricing = [
        {
          id: '1',
          name: 'Company 1',
          status: 'active',
          pricing: {
            baseRates: {
              standard: 5.99
            }
          }
        }
      ];
      
      require('../../services/deliveryCompanyService').deliveryCompanyService.getCompaniesByStatus.mockResolvedValue(mockCompaniesWithPricing);
      require('../../services/deliveryCompanyService').deliveryCompanyService.getCompanyPricing.mockResolvedValue(mockCompaniesWithPricing[0].pricing);
      
      const result = await CheckoutService.getDeliveryOptions('123 Main St');
      
      expect(result).toHaveLength(1);
      expect(result[0].deliveryRate).toBe(5.99);
    });

    it('should handle companies without pricing', async () => {
      require('../../services/deliveryCompanyService').deliveryCompanyService.getCompaniesByStatus.mockResolvedValue(mockActiveCompanies);
      require('../../services/deliveryCompanyService').deliveryCompanyService.getCompanyPricing.mockResolvedValue(null);
      
      const result = await CheckoutService.getDeliveryOptions('123 Main St');
      
      expect(result).toHaveLength(2);
      expect(result[0].deliveryRate).toBe(0);
      expect(result[1].deliveryRate).toBe(0);
    });
  });
});