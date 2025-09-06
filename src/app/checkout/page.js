"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/stores/useAuth';
import { useRouter } from 'next/navigation';
import { useUnifiedBasket } from '@/hooks/useUnifiedBasket';
import DeliveryCompanySelector from '@/components/DeliveryCompanySelector';
import { CheckoutService } from '@/services/checkoutService';

const CheckoutPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { items: basketItems, totalItems, totalPrice } = useUnifiedBasket();
  const router = useRouter();
  const [step, setStep] = useState('delivery'); // 'delivery', 'payment', 'confirmation'
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to auth if not logged in
    if (!authLoading && !user) {
      router.push('/auth');
    }
    
    // Redirect to home if basket is empty
    if (!authLoading && user && basketItems.length === 0) {
      router.push('/');
    }
  }, [authLoading, user, basketItems, router]);

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
  };

  const handleDeliveryContinue = () => {
    if (selectedCompany) {
      setStep('payment');
    }
  };

  const handlePaymentChange = (field, value) => {
    setPaymentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlaceOrder = async () => {
    if (!selectedCompany || !user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call the checkout service
      // const result = await CheckoutService.processCheckout(
      //   user.uid, 
      //   selectedCompany.id, 
      //   paymentInfo
      // );
      
      // Simulate checkout processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful order
      const mockOrder = {
        id: `order_${Date.now()}`,
        userId: user.uid,
        items: basketItems,
        deliveryCompany: selectedCompany,
        total: totalPrice + selectedCompany.deliveryRate,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };
      
      setOrderDetails(mockOrder);
      setStep('confirmation');
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDeliveryStep = () => (
    <div className="bg-card rounded-lg shadow p-6 border border-border">
      <DeliveryCompanySelector
        selectedCompany={selectedCompany}
        onCompanySelect={handleCompanySelect}
        onContinue={handleDeliveryContinue}
        loading={loading}
        error={error}
      />
    </div>
  );

  const renderPaymentStep = () => (
    <div className="bg-card rounded-lg shadow p-6 border border-border">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Payment Information</h2>
        <p className="text-muted-foreground">Enter your payment details</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Name on Card
          </label>
          <input
            type="text"
            value={paymentInfo.name}
            onChange={(e) => handlePaymentChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            placeholder="John Doe"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Card Number
          </label>
          <input
            type="text"
            value={paymentInfo.cardNumber}
            onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            placeholder="1234 5678 9012 3456"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Expiry Date
          </label>
          <input
            type="text"
            value={paymentInfo.expiryDate}
            onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            placeholder="MM/YY"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            CVV
          </label>
          <input
            type="text"
            value={paymentInfo.cvv}
            onChange={(e) => handlePaymentChange('cvv', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            placeholder="123"
          />
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="bg-secondary rounded-lg p-4 mb-6">
        <h3 className="font-medium text-foreground mb-3">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery ({selectedCompany?.name})</span>
            <span>${selectedCompany?.deliveryRate?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-border pt-2">
            <span>Total</span>
            <span>${selectedCompany ? (totalPrice + selectedCompany.deliveryRate).toFixed(2) : totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <button
          onClick={() => setStep('delivery')}
          className="px-6 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-secondary"
        >
          Back
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="bg-card rounded-lg shadow p-6 text-center border border-border">
      <div className="text-success mb-4">
        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h2>
      <p className="text-muted-foreground mb-6">
        Thank you for your order. A confirmation email has been sent to {user?.email}.
      </p>
      
      <div className="bg-secondary rounded-lg p-4 mb-6 text-left">
        <h3 className="font-medium text-foreground mb-2">Order Details</h3>
        <p className="text-sm text-muted-foreground">Order ID: {orderDetails?.id}</p>
        <p className="text-sm text-muted-foreground">Delivery Company: {selectedCompany?.name}</p>
        <p className="text-sm text-muted-foreground">Estimated Delivery: {selectedCompany?.estimatedTime}</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => router.push('/orders')}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
        >
          View Order Status
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-secondary"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="flex items-center">
              <div className={`flex flex-col items-center ${step === 'delivery' ? 'text-accent' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step === 'delivery' ? 'bg-accent text-accent-foreground' : 'bg-secondary'}`}>
                  1
                </div>
                <span className="text-sm font-medium">Delivery</span>
              </div>
              
              <div className="w-16 h-0.5 bg-border mx-2"></div>
              
              <div className={`flex flex-col items-center ${step === 'payment' ? 'text-accent' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step === 'payment' ? 'bg-accent text-accent-foreground' : 'bg-secondary'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Payment</span>
              </div>
              
              <div className="w-16 h-0.5 bg-border mx-2"></div>
              
              <div className={`flex flex-col items-center ${step === 'confirmation' ? 'text-accent' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${step === 'confirmation' ? 'bg-accent text-accent-foreground' : 'bg-secondary'}`}>
                  3
                </div>
                <span className="text-sm font-medium">Confirmation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          {step === 'delivery' && renderDeliveryStep()}
          {step === 'payment' && renderPaymentStep()}
          {step === 'confirmation' && renderConfirmationStep()}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;