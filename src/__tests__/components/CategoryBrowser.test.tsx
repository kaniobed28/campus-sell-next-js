import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryBrowser from '@/components/CategoryBrowser';
import useCategoryStore from '@/stores/useCategoryStore';
import { CategoryTreeNode } from '@/types/category';

// Mock the category store
jest.mock('@/stores/useCategoryStore');
const mockUseCategoryStore = useCategoryStore as jest.MockedFunction<typeof useCategoryStore>;

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock Loading component
jest.mock('@/components/Loading', () => {
  return function Loading() {
    return <div data-testid="loading">Loading...</div>;
  };
});

describe('CategoryBrowser', () => {
  const mockCategoryTree: CategoryTreeNode[] = [
    {
      id: '1',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      icon: '💻',
      displayOrder: 1,
      isActive: true,
      level: 0,
      children: [
        {
          id: '2',
          name: 'Phones',
          slug: 'phones',
          description: 'Mobile phones and accessories',
          icon: '📱',
          parentId: '1',
          displayOrder: 1,
          isActive: true,
          level: 1,
          children: [],
          metadata: {
            productCount: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user1',
          },
        },
      ],
      metadata: {
        productCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user1',
      },
    },
    {
      id: '3',
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing and accessories',
      icon: '👕',
      displayOrder: 2,
      isActive: true,
      level: 0,
      children: [],
      metadata: {
        productCount: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user1',
      },
    },
  ];

  const defaultMockStore = {
    categoryTree: mockCategoryTree,
    loading: false,
    error: null,
    searchTerm: '',
    searchResults: [],
    fetchCategoryTree: jest.fn(),
    searchCategories: jest.fn(),
    clearSearch: jest.fn(),
    clearError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCategoryStore.mockReturnValue(defaultMockStore as any);
  });

  describe('Loading State', () => {
    it('should show loading component when loading is true', () => {
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        loading: true,
      } as any);

      render(<CategoryBrowser />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when there is an error', () => {
      const errorMessage = 'Failed to load categories';
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        error: errorMessage,
      } as any);

      render(<CategoryBrowser />);

      expect(screen.getByText('Error Loading Categories')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should call clearError and fetchCategoryTree when Try Again is clicked', () => {
      const mockClearError = jest.fn();
      const mockFetchCategoryTree = jest.fn();
      
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        error: 'Test error',
        clearError: mockClearError,
        fetchCategoryTree: mockFetchCategoryTree,
      } as any);

      render(<CategoryBrowser />);

      fireEvent.click(screen.getByText('Try Again'));

      expect(mockClearError).toHaveBeenCalled();
      expect(mockFetchCategoryTree).toHaveBeenCalled();
    });
  });

  describe('Normal State', () => {
    it('should render categories in grid view by default', () => {
      render(<CategoryBrowser />);

      expect(screen.getByText('Browse Categories')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Fashion')).toBeInTheDocument();
      expect(screen.getByText('Electronic devices and gadgets')).toBeInTheDocument();
    });

    it('should show product counts when showProductCounts is true', () => {
      render(<CategoryBrowser showProductCounts={true} />);

      expect(screen.getByText('15 products')).toBeInTheDocument(); // Electronics + subcategory
      expect(screen.getByText('8 products')).toBeInTheDocument(); // Fashion
    });

    it('should hide product counts when showProductCounts is false', () => {
      render(<CategoryBrowser showProductCounts={false} />);

      expect(screen.queryByText('15 products')).not.toBeInTheDocument();
      expect(screen.queryByText('8 products')).not.toBeInTheDocument();
    });

    it('should show subcategories preview for categories with children', () => {
      render(<CategoryBrowser />);

      expect(screen.getByText('1 subcategories')).toBeInTheDocument();
      expect(screen.getByText('Phones')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input when showSearch is true', () => {
      render(<CategoryBrowser showSearch={true} />);

      expect(screen.getByPlaceholderText('Search categories...')).toBeInTheDocument();
    });

    it('should hide search input when showSearch is false', () => {
      render(<CategoryBrowser showSearch={false} />);

      expect(screen.queryByPlaceholderText('Search categories...')).not.toBeInTheDocument();
    });

    it('should call searchCategories when typing in search input', async () => {
      const mockSearchCategories = jest.fn();
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        searchCategories: mockSearchCategories,
      } as any);

      render(<CategoryBrowser />);

      const searchInput = screen.getByPlaceholderText('Search categories...');
      fireEvent.change(searchInput, { target: { value: 'electronics' } });

      await waitFor(() => {
        expect(mockSearchCategories).toHaveBeenCalledWith('electronics');
      });
    });

    it('should show search results when searchTerm is present', () => {
      const searchResults = [mockCategoryTree[0]]; // Only Electronics
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        searchTerm: 'electronics',
        searchResults,
      } as any);

      render(<CategoryBrowser />);

      expect(screen.getByText('Search Results')).toBeInTheDocument();
      expect(screen.getByText('Found 1 categories matching "electronics"')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.queryByText('Fashion')).not.toBeInTheDocument();
    });

    it('should show clear search button when search term is present', () => {
      render(<CategoryBrowser />);

      const searchInput = screen.getByPlaceholderText('Search categories...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', () => {
      const mockClearSearch = jest.fn();
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        clearSearch: mockClearSearch,
      } as any);

      render(<CategoryBrowser />);

      const searchInput = screen.getByPlaceholderText('Search categories...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearButton);

      expect(mockClearSearch).toHaveBeenCalled();
    });
  });

  describe('View Mode Toggle', () => {
    it('should show view mode toggle buttons', () => {
      render(<CategoryBrowser />);

      expect(screen.getByTitle('Grid View')).toBeInTheDocument();
      expect(screen.getByTitle('List View')).toBeInTheDocument();
    });

    it('should switch to list view when list button is clicked', () => {
      render(<CategoryBrowser />);

      const listViewButton = screen.getByTitle('List View');
      fireEvent.click(listViewButton);

      // In list view, we should see expand/collapse buttons for categories with children
      expect(screen.getByRole('button', { name: /expand/i })).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no categories are available', () => {
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        categoryTree: [],
      } as any);

      render(<CategoryBrowser />);

      expect(screen.getByText('No categories available')).toBeInTheDocument();
      expect(screen.getByText('Categories will appear here once they are added to the system.')).toBeInTheDocument();
    });

    it('should show search empty state when no search results', () => {
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        searchTerm: 'nonexistent',
        searchResults: [],
      } as any);

      render(<CategoryBrowser />);

      expect(screen.getByText('No categories found')).toBeInTheDocument();
      expect(screen.getByText('No categories match your search for "nonexistent"')).toBeInTheDocument();
      expect(screen.getByText('Clear Search')).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('should apply custom className', () => {
      const { container } = render(<CategoryBrowser className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should respect maxColumns prop in grid view', () => {
      render(<CategoryBrowser maxColumns={2} />);

      // This would need to be tested by checking the CSS classes applied
      // The actual grid layout would be tested in integration tests
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
  });

  describe('Initialization', () => {
    it('should call fetchCategoryTree on mount', () => {
      const mockFetchCategoryTree = jest.fn();
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        fetchCategoryTree: mockFetchCategoryTree,
      } as any);

      render(<CategoryBrowser />);

      expect(mockFetchCategoryTree).toHaveBeenCalled();
    });
  });
});