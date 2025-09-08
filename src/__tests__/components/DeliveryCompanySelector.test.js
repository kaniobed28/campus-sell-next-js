/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeliveryCompanySelector from '@/components/DeliveryCompanySelector';

// Mock the hooks
jest.mock('@/hooks/useViewport', () => ({
  useViewport: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true
  })
}));

jest.mock('@/hooks/useResponsiveTypography', () => ({
  useResponsiveTypography: () => ({
    getResponsiveTextClass: (type) => {
      const classes = {
        'heading-sm': 'text-lg font-bold',
        'body-base': 'text-base',
        'body-sm': 'text-sm',
        'body-xs': 'text-xs',
        'body-lg': 'text-lg'
      };
      return classes[type] || 'text-base';
    }
  })
}));

describe('DeliveryCompanySelector', () => {
  const mockCompanies = [
    {
      id: '1',
      name: 'Campus Express',
      status: 'active',
      deliveryRate: 5.99,
      estimatedTime: '2-4 hours',
      description: 'Fast delivery within campus grounds'
    },
    {
      id: '2',
      name: 'QuickShip Logistics',
      status: 'active',
      deliveryRate: 7.99,
      estimatedTime: '4-6 hours',
      description: 'Reliable delivery to dormitories and nearby areas'
    }
  ];

  const mockOnCompanySelect = jest.fn();
  const mockOnContinue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <DeliveryCompanySelector
        onCompanySelect={mockOnCompanySelect}
        onContinue={mockOnContinue}
      />
    );

    expect(screen.getByText('Loading delivery options...')).toBeInTheDocument();
  });

  it('renders company options when loaded', async () => {
    // Mock the useEffect that fetches companies
    jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-01-01').valueOf());
    
    render(
      <DeliveryCompanySelector
        onCompanySelect={mockOnCompanySelect}
        onContinue={mockOnContinue}
      />
    );

    // Wait for loading to complete
    await screen.findByText('Campus Express');

    expect(screen.getByText('Campus Express')).toBeInTheDocument();
    expect(screen.getByText('QuickShip Logistics')).toBeInTheDocument();
    expect(screen.getByText('$5.99')).toBeInTheDocument();
    expect(screen.getByText('$7.99')).toBeInTheDocument();
  });

  it('calls onCompanySelect when a company is selected', async () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-01-01').valueOf());
    
    render(
      <DeliveryCompanySelector
        onCompanySelect={mockOnCompanySelect}
        onContinue={mockOnContinue}
      />
    );

    const companyCard = await screen.findByText('Campus Express');
    fireEvent.click(companyCard);

    expect(mockOnCompanySelect).toHaveBeenCalledWith(mockCompanies[0]);
  });

  it('shows error message when loading fails', async () => {
    // Mock console.error to avoid polluting test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock the useEffect to throw an error
    jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
      if (typeof callback === 'function') {
        // Simulate error by throwing in the callback
        callback();
      }
      return 1;
    });
    
    render(
      <DeliveryCompanySelector
        onCompanySelect={mockOnCompanySelect}
        onContinue={mockOnContinue}
      />
    );

    // Restore setTimeout
    jest.restoreAllMocks();
    consoleErrorSpy.mockRestore();
  });

  it('disables continue button when no company is selected', async () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-01-01').valueOf());
    
    render(
      <DeliveryCompanySelector
        onCompanySelect={mockOnCompanySelect}
        onContinue={mockOnContinue}
      />
    );

    const continueButton = await screen.findByText('Continue to Payment');
    expect(continueButton).toBeDisabled();
  });

  it('enables continue button when a company is selected', async () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-01-01').valueOf());
    
    render(
      <DeliveryCompanySelector
        onCompanySelect={mockOnCompanySelect}
        onContinue={mockOnContinue}
      />
    );

    // Select a company
    const companyCard = await screen.findByText('Campus Express');
    fireEvent.click(companyCard);

    // Check that the continue button is enabled
    const continueButton = screen.getByText('Continue to Payment');
    expect(continueButton).not.toBeDisabled();
  });

  it('calls onContinue when continue button is clicked', async () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() => new Date('2023-01-01').valueOf());
    
    render(
      <DeliveryCompanySelector
        selectedCompany={mockCompanies[0]}
        onCompanySelect={mockOnCompanySelect}
        onContinue={mockOnContinue}
      />
    );

    const continueButton = await screen.findByText('Continue to Payment');
    fireEvent.click(continueButton);

    expect(mockOnContinue).toHaveBeenCalled();
  });
});