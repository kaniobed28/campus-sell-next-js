/**
 * SearchPage Component Tests
 */

import { render, screen } from '@testing-library/react';
import SearchPage from '@/components/SearchPage';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue('test query')
  })
}));

// Mock the useSearch hook
jest.mock('@/hooks/useSearch', () => ({
  __esModule: true,
  default: () => ({
    filters: {
      query: 'test query',
      categories: [],
      priceRange: { min: null, max: null },
      condition: [],
      tags: [],
      sellerId: null,
      dateRange: { start: null, end: null },
      inStock: false,
      onSale: false
    },
    sortOptions: {
      field: 'createdAt',
      direction: 'desc'
    },
    pagination: {
      page: 1,
      limit: 20,
      lastDoc: null
    },
    results: [],
    totalCount: 0,
    hasNextPage: false,
    isLoading: false,
    error: null,
    facetCounts: {
      categories: {},
      conditions: {},
      priceRange: { min: 0, max: 1000 }
    },
    updateFilters: jest.fn(),
    updateSort: jest.fn(),
    updatePagination: jest.fn(),
    executeSearch: jest.fn(),
    resetSearch: jest.fn()
  })
}));

// Mock useViewport hook
jest.mock('@/hooks/useViewport', () => ({
  useResponsiveSpacing: () => ({
    container: 'px-4'
  })
}));

describe('SearchPage', () => {
  it('should render search page with header', () => {
    render(<SearchPage />);
    
    expect(screen.getByText('Search Results')).toBeInTheDocument();
    expect(screen.getByText('Showing results for "test query"')).toBeInTheDocument();
  });

  it('should render filter components', () => {
    render(<SearchPage />);
    
    // Check that filter sections are rendered
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('Condition')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
  });

  it('should render sort controls', () => {
    render(<SearchPage />);
    
    expect(screen.getByText('Sort by:')).toBeInTheDocument();
  });

  it('should show no results message when there are no results', () => {
    render(<SearchPage />);
    
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});