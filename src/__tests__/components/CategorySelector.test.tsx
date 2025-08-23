import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategorySelector from '@/components/CategorySelector';
import useCategoryStore from '@/stores/useCategoryStore';
import { Category } from '@/types/category';

// Mock the category store
jest.mock('@/stores/useCategoryStore');
const mockUseCategoryStore = useCategoryStore as jest.MockedFunction<typeof useCategoryStore>;

describe('CategorySelector', () => {
  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      icon: '💻',
      displayOrder: 1,
      isActive: true,
      metadata: {
        productCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user1',
      },
    },
    {
      id: '2',
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing and accessories',
      icon: '👕',
      displayOrder: 2,
      isActive: true,
      metadata: {
        productCount: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user1',
      },
    },
    {
      id: '3',
      name: 'Phones',
      slug: 'phones',
      description: 'Mobile phones and accessories',
      icon: '📱',
      parentId: '1',
      displayOrder: 1,
      isActive: true,
      metadata: {
        productCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user1',
      },
    },
  ];

  const mockSubcategories = [mockCategories[2]]; // Phones subcategory

  const defaultMockStore = {
    categories: mockCategories,
    subcategories: [],
    loading: false,
    error: null,
    fetchCategories: jest.fn(),
    fetchSubcategories: jest.fn(),
    searchCategories: jest.fn(),
    clearSearch: jest.fn(),
  };

  const mockProps = {
    onCategoryChange: jest.fn(),
    onSubcategoryChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCategoryStore.mockReturnValue(defaultMockStore as any);
  });

  describe('Rendering', () => {
    it('should render category selector with default placeholder', () => {
      render(<CategorySelector {...mockProps} />);

      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Select a category...')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      render(<CategorySelector {...mockProps} placeholder="Choose category" />);

      expect(screen.getByText('Choose category')).toBeInTheDocument();
    });

    it('should show required asterisk when required prop is true', () => {
      render(<CategorySelector {...mockProps} required />);

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<CategorySelector {...mockProps} className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Category Selection', () => {
    it('should open dropdown when category button is clicked', () => {
      render(<CategorySelector {...mockProps} />);

      const categoryButton = screen.getByRole('button', { name: /select a category/i });
      fireEvent.click(categoryButton);

      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Fashion')).toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', () => {
      render(<CategorySelector {...mockProps} />);

      const categoryButton = screen.getByRole('button', { name: /select a category/i });
      fireEvent.click(categoryButton);

      expect(screen.getByText('Electronics')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(document.body);

      expect(screen.queryByText('Electronics')).not.toBeInTheDocument();
    });

    it('should call onCategoryChange when category is selected', () => {
      render(<CategorySelector {...mockProps} />);

      const categoryButton = screen.getByRole('button', { name: /select a category/i });
      fireEvent.click(categoryButton);

      const electronicsOption = screen.getByText('Electronics');
      fireEvent.click(electronicsOption);

      expect(mockProps.onCategoryChange).toHaveBeenCalledWith('1', mockCategories[0]);
    });

    it('should display selected category', () => {
      render(<CategorySelector {...mockProps} selectedCategoryId="1" />);

      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('💻')).toBeInTheDocument();
    });

    it('should show clear button when category is selected', () => {
      render(<CategorySelector {...mockProps} selectedCategoryId="1" />);

      const clearButton = screen.getByRole('button', { name: /clear/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear category when clear button is clicked', () => {
      render(<CategorySelector {...mockProps} selectedCategoryId="1" />);

      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);

      expect(mockProps.onCategoryChange).toHaveBeenCalledWith('', null);
      expect(mockProps.onSubcategoryChange).toHaveBeenCalledWith('', null);
    });
  });

  describe('Subcategory Selection', () => {
    it('should show subcategory selector when category is selected and has subcategories', () => {
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        subcategories: mockSubcategories,
      } as any);

      render(<CategorySelector {...mockProps} selectedCategoryId="1" />);

      expect(screen.getByText('Subcategory')).toBeInTheDocument();
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('should not show subcategory selector when no subcategories exist', () => {
      render(<CategorySelector {...mockProps} selectedCategoryId="1" />);

      expect(screen.queryByText('Subcategory')).not.toBeInTheDocument();
    });

    it('should call onSubcategoryChange when subcategory is selected', () => {
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        subcategories: mockSubcategories,
      } as any);

      render(<CategorySelector {...mockProps} selectedCategoryId="1" />);

      const subcategorySelect = screen.getByDisplayValue('');
      fireEvent.change(subcategorySelect, { target: { value: '3' } });

      expect(mockProps.onSubcategoryChange).toHaveBeenCalledWith('3', mockSubcategories[0]);
    });

    it('should display selected subcategory', () => {
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        subcategories: mockSubcategories,
      } as any);

      render(<CategorySelector {...mockProps} selectedCategoryId="1" selectedSubcategoryId="3" />);

      const subcategorySelect = screen.getByDisplayValue('3');
      expect(subcategorySelect).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should show search input when showSearch is true', () => {
      render(<CategorySelector {...mockProps} showSearch={true} />);

      const categoryButton = screen.getByRole('button', { name: /select a category/i });
      fireEvent.click(categoryButton);

      expect(screen.getByPlaceholderText('Search categories...')).toBeInTheDocument();
    });

    it('should hide search input when showSearch is false', () => {
      render(<CategorySelector {...mockProps} showSearch={false} />);

      const categoryButton = screen.getByRole('button', { name: /select a category/i });
      fireEvent.click(categoryButton);

      expect(screen.queryByPlaceholderText('Search categories...')).not.toBeInTheDocument();
    });

    it('should filter categories when searching', () => {
      render(<CategorySelector {...mockProps} />);

      const categoryButton = screen.getByRole('button', { name: /select a category/i });
      fireEvent.click(categoryButton);

      const searchInput = screen.getByPlaceholderText('Search categories...');
      fireEvent.change(searchInput, { target: { value: 'electronics' } });

      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.queryByText('Fashion')).not.toBeInTheDocument();
    });

    it('should show all categories when search is cleared', () => {
      render(<CategorySelector {...mockProps} />);

      const categoryButton = screen.getByRole('button', { name: /select a category/i });
      fireEvent.click(categoryButton);

      const searchInput = screen.getByPlaceholderText('Search categories...');
      fireEvent.change(searchInput, { target: { value: 'electronics' } });
      fireEvent.change(searchInput, { target: { value: '' } });

      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Fashion')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state', () => {
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        loading: true,
      } as any);

      render(<CategorySelector {...mockProps} />);

      const categoryButton = screen.getByRole('button', { name: /select a category/i });
      fireEvent.click(categoryButton);

      expect(screen.getByText('Loading categories...')).toBeInTheDocument();
    });

    it('should show error message when there is a store error', () => {
      const errorMessage = 'Failed to load categories';
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        error: errorMessage,
      } as any);

      render(<CategorySelector {...mockProps} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show custom error message', () => {
      const customError = 'Please select a category';
      render(<CategorySelector {...mockProps} error={customError} />);

      expect(screen.getByText(customError)).toBeInTheDocument();
    });

    it('should show no categories message when categories array is empty', () => {
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        categories: [],
      } as any);

      render(<CategorySelector {...mockProps} />);

      const categoryButton = screen.getByRole('button', { name: /select a category/i });
      fireEvent.click(categoryButton);

      expect(screen.getByText('No categories available')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable category button when disabled prop is true', () => {
      render(<CategorySelector {...mockProps} disabled />);

      const categoryButton = screen.getByRole('button', { name: /select a category/i });
      expect(categoryButton).toBeDisabled();
    });

    it('should not show clear button when disabled', () => {
      render(<CategorySelector {...mockProps} selectedCategoryId="1" disabled />);

      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    });

    it('should disable subcategory select when disabled', () => {
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        subcategories: mockSubcategories,
      } as any);

      render(<CategorySelector {...mockProps} selectedCategoryId="1" disabled />);

      const subcategorySelect = screen.getByDisplayValue('');
      expect(subcategorySelect).toBeDisabled();
    });
  });

  describe('Initialization', () => {
    it('should call fetchCategories on mount', () => {
      const mockFetchCategories = jest.fn();
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        fetchCategories: mockFetchCategories,
      } as any);

      render(<CategorySelector {...mockProps} />);

      expect(mockFetchCategories).toHaveBeenCalled();
    });

    it('should fetch subcategories when selectedCategoryId is provided', () => {
      const mockFetchSubcategories = jest.fn();
      mockUseCategoryStore.mockReturnValue({
        ...defaultMockStore,
        fetchSubcategories: mockFetchSubcategories,
      } as any);

      render(<CategorySelector {...mockProps} selectedCategoryId="1" />);

      expect(mockFetchSubcategories).toHaveBeenCalledWith('1');
    });
  });
});