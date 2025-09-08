import React from 'react';
import { render } from '@testing-library/react';
import ProductDetails from '@/components/ProductDetails';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

// Mock the Button component since it's not relevant for this test
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, loading, variant, size, className }) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

describe('ProductDetails', () => {
  const mockProduct = {
    id: '1',
    title: 'Test Product',
    category: 'Books & Education',
    price: 29.99,
    description: 'Test description',
    createdAt: { seconds: 1625097600 },
  };

  it('generates correct category slug for breadcrumb link', () => {
    const { container } = render(
      <ProductDetails 
        product={mockProduct} 
        onAddToCart={jest.fn()} 
        isLoading={false} 
        isAuthenticated={true} 
      />
    );
    
    // Find the category link in breadcrumbs
    const categoryLink = container.querySelector('nav ol li:nth-child(3) a');
    
    // Should link to the correct category page URL
    expect(categoryLink).toHaveAttribute('href', '/categories/books-education');
    expect(categoryLink).toHaveTextContent('Books & Education');
  });

  it('handles product with categorySlug property', () => {
    const productWithSlug = {
      ...mockProduct,
      categorySlug: 'books-education-special'
    };
    
    const { container } = render(
      <ProductDetails 
        product={productWithSlug} 
        onAddToCart={jest.fn()} 
        isLoading={false} 
        isAuthenticated={true} 
      />
    );
    
    // Should use the provided categorySlug
    const categoryLink = container.querySelector('nav ol li:nth-child(3) a');
    expect(categoryLink).toHaveAttribute('href', '/categories/books-education-special');
  });

  it('handles product with missing category data', () => {
    const productWithoutCategory = {
      ...mockProduct,
      category: null
    };
    
    const { container } = render(
      <ProductDetails 
        product={productWithoutCategory} 
        onAddToCart={jest.fn()} 
        isLoading={false} 
        isAuthenticated={true} 
      />
    );
    
    // Should fall back to 'uncategorized'
    const categoryLink = container.querySelector('nav ol li:nth-child(3) a');
    expect(categoryLink).toHaveAttribute('href', '/categories/uncategorized');
  });
});