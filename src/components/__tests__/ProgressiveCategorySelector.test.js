import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressiveCategorySelector from '../ProgressiveCategorySelector';

// Mock the dependencies
jest.mock('@/lib/fallbackData', () => ({
  getCategoryOptions: () => [
    {
      value: 'cat1',
      label: 'Electronics',
      slug: 'electronics',
      icon: '💻',
      isParent: true
    },
    {
      value: 'cat2',
      label: '  Mobile Phones',
      slug: 'mobile-phones',
      icon: '📱',
      parentId: 'cat1'
    }
  ],
  isUsingFallbackData: () => true
}));

jest.mock('@/lib/progressiveLoader', () => ({
  subscribeToCategories: () => jest.fn()
}));

describe('ProgressiveCategorySelector', () => {
  const mockOnCategoryChange = jest.fn();
  const mockOnSubcategoryChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders category selector with options', () => {
    render(
      <ProgressiveCategorySelector
        onCategoryChange={mockOnCategoryChange}
        onSubcategoryChange={mockOnSubcategoryChange}
      />
    );

    expect(screen.getByText('Select a category...')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Electronics'))).toBeInTheDocument();
  });

  it('calls onCategoryChange with complete category object when category is selected', () => {
    render(
      <ProgressiveCategorySelector
        onCategoryChange={mockOnCategoryChange}
        onSubcategoryChange={mockOnSubcategoryChange}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'cat1' } });

    expect(mockOnCategoryChange).toHaveBeenCalledWith('cat1', {
      value: 'cat1',
      label: 'Electronics',
      slug: 'electronics',
      icon: '💻',
      isParent: true
    });
  });

  it('shows subcategory selector when category is selected', () => {
    render(
      <ProgressiveCategorySelector
        selectedCategoryId="cat1"
        onCategoryChange={mockOnCategoryChange}
        onSubcategoryChange={mockOnSubcategoryChange}
      />
    );

    expect(screen.getByText('Select a subcategory (optional)...')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Mobile Phones'))).toBeInTheDocument();
  });

  it('calls onSubcategoryChange with complete subcategory object when subcategory is selected', () => {
    render(
      <ProgressiveCategorySelector
        selectedCategoryId="cat1"
        onCategoryChange={mockOnCategoryChange}
        onSubcategoryChange={mockOnSubcategoryChange}
      />
    );

    const subcategorySelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(subcategorySelect, { target: { value: 'cat2' } });

    expect(mockOnSubcategoryChange).toHaveBeenCalledWith('cat2', {
      value: 'cat2',
      label: '  Mobile Phones',
      slug: 'mobile-phones',
      icon: '📱',
      parentId: 'cat1'
    });
  });
});