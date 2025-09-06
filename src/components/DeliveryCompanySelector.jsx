"use client";

import React, { useState, useEffect } from 'react';
import { useViewport } from '@/hooks/useViewport';
import { useResponsiveTypography } from '@/hooks/useResponsiveTypography';

const DeliveryCompanySelector = ({ 
  selectedCompany, 
  onCompanySelect, 
  onContinue,
  loading = false,
  error = null
}) => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const { isMobile, isTablet } = useViewport();
  const { getResponsiveTextClass } = useResponsiveTypography();

  // In a real implementation, this would fetch from the checkout service
  // For now, we'll simulate the data
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        setLocalError(null);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data - in real implementation, this would come from checkoutService.getActiveDeliveryCompanies()
        const mockCompanies = [
          {
            id: '1',
            name: 'Campus Express',
            status: 'active',
            deliveryRate: 5.99,
            estimatedTime: '2-4 hours',
            description: 'Fast delivery within campus grounds',
            logo: '/delivery-logos/campus-express.png'
          },
          {
            id: '2',
            name: 'QuickShip Logistics',
            status: 'active',
            deliveryRate: 7.99,
            estimatedTime: '4-6 hours',
            description: 'Reliable delivery to dormitories and nearby areas',
            logo: '/delivery-logos/quickship.png'
          },
          {
            id: '3',
            name: 'EcoDeliver',
            status: 'active',
            deliveryRate: 4.99,
            estimatedTime: '6-12 hours',
            description: 'Eco-friendly delivery with carbon-neutral shipping',
            logo: '/delivery-logos/ecodeliver.png'
          }
        ];
        
        setCompanies(mockCompanies);
      } catch (err) {
        console.error('Error fetching delivery companies:', err);
        setLocalError('Failed to load delivery companies. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleCompanySelect = (company) => {
    onCompanySelect(company);
  };

  const handleContinue = () => {
    if (selectedCompany) {
      onContinue();
    }
  };

  const renderCompanyCard = (company) => {
    const isSelected = selectedCompany && selectedCompany.id === company.id;
    
    return (
      <div
        key={company.id}
        onClick={() => handleCompanySelect(company)}
        className={`
          border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
          ${isSelected 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
          }
          ${isMobile ? 'mb-3' : 'mb-4'}
        `}
      >
        <div className="flex items-center">
          {company.logo && (
            <div className="flex-shrink-0 mr-4">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
            </div>
          )}
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h3 className={`font-semibold ${getResponsiveTextClass('body-lg')}`}>
                {company.name}
              </h3>
              <span className={`font-bold ${getResponsiveTextClass('body-lg')} text-green-600`}>
                ${company.deliveryRate.toFixed(2)}
              </span>
            </div>
            <p className={`${getResponsiveTextClass('body-sm')} text-gray-600 mt-1`}>
              {company.description}
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className={`${getResponsiveTextClass('body-xs')} text-gray-500`}>
                Est. {company.estimatedTime}
              </span>
              {isSelected && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Selected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || loading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className={getResponsiveTextClass('body-base')}>Loading delivery options...</p>
      </div>
    );
  }

  if (localError || error) {
    return (
      <div className="py-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className={`text-red-600 ${getResponsiveTextClass('body-base')} mb-4`}>
          {localError || error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className={`font-medium ${getResponsiveTextClass('body-lg')} text-gray-900 mb-2`}>
          No Delivery Options Available
        </h3>
        <p className={`${getResponsiveTextClass('body-base')} text-gray-600`}>
          Currently, there are no delivery companies available. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-6">
        <h2 className={`font-bold ${getResponsiveTextClass('heading-sm')} text-gray-900 mb-2`}>
          Select Delivery Method
        </h2>
        <p className={`${getResponsiveTextClass('body-base')} text-gray-600`}>
          Choose a delivery company for your order
        </p>
      </div>

      <div className="mb-6">
        {companies.map(renderCompanyCard)}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!selectedCompany || loading}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors duration-200
            ${selectedCompany && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            ${isMobile ? 'w-full' : 'w-auto'}
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
              Processing...
            </span>
          ) : (
            'Continue to Payment'
          )}
        </button>
      </div>
    </div>
  );
};

export default DeliveryCompanySelector;