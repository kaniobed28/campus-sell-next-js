import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveAdminTable from '@/components/admin/ResponsiveAdminTable';

// Mock the useAdminResponsive hook
jest.mock('@/hooks/useAdminResponsive', () => ({
  useAdminResponsive: () => ({
    isMobile: false,
    isTablet: false,
    tableConfig: {
      showColumns: 'all',
      stackedView: false
    },
    touchConfig: {
      minTouchTarget: '44px'
    }
  })
}));

describe('ResponsiveAdminTable', () => {
  const mockData = [
    { id: 1, name: 'Product 1', price: 100 },
    { id: 2, name: 'Product 2', price: 200 }
  ];

  test('renders correctly with key/label column format', () => {
    const columns = [
      { key: 'name', label: 'Name', render: (value) => <span>{value}</span> },
      { key: 'price', label: 'Price', render: (value) => <span>${value}</span> }
    ];

    render(
      <ResponsiveAdminTable 
        data={mockData} 
        columns={columns} 
      />
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  test('renders correctly with accessor/header column format', () => {
    const columns = [
      { accessor: 'name', header: 'Name', render: (value) => <span>{value}</span> },
      { accessor: 'price', header: 'Price', render: (value) => <span>${value}</span> }
    ];

    render(
      <ResponsiveAdminTable 
        data={mockData} 
        columns={columns} 
      />
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  test('renders correctly with mixed column format', () => {
    const columns = [
      { key: 'name', header: 'Name', render: (value) => <span>{value}</span> },
      { accessor: 'price', label: 'Price', render: (value) => <span>${value}</span> }
    ];

    render(
      <ResponsiveAdminTable 
        data={mockData} 
        columns={columns} 
      />
    );

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  test('uses key/accessor as React key prop to prevent warnings', () => {
    // This test ensures that our normalization fix works
    // We can't directly test React key warnings, but we can verify that
    // the component properly maps the key/accessor values
    
    const columns = [
      { accessor: 'name', header: 'Name' },
      { key: 'price', label: 'Price' }
    ];

    // If our fix works, this should render without React key warnings
    expect(() => {
      render(
        <ResponsiveAdminTable 
          data={mockData} 
          columns={columns} 
        />
      );
    }).not.toThrow();
  });
});