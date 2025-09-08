import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductGrid from '../ProductGrid';
import { useViewport } from '@/hooks/useViewport';

// Mock the viewport hook
jest.mock('@/hooks/useViewport');

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>;
});

jest.mock('next/image', () => {
  return ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />;
});

// Mock data
const mockProducts = [
  {
    id: '1',
    title: 'Test Product 1',
    price: 29.99,
    image: '/test-image-1.jpg',
    description: 'Test description 1',
    likes: 15,
    views: 120
  },
  {
    id: '2',
    title: 'Test Product 2',
    price: 49.99,
    image: '/test-image-2.jpg',
    description: 'Test description 2',
    likes: 25,
    views: 200
  },
  {
    id: '3',
    title: 'Test Product 3',
    price: 19.99,
    image: '/test-image-3.jpg',
    description: 'Test description 3',
    likes: 8,
    views: 80
  },
  {
    id: '4',
    title: 'Test Product 4',
    price: 39.99,
    image: '/test-image-4.jpg',
    description: 'Test description 4',
    likes: 30,
    views: 250
  }
];

describe('ProductGrid Component', () => {
  beforeEach(() => {
    // Default viewport mock
    useViewport.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      width: 1024,
      height: 768,
      deviceType: 'desktop'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Responsive Grid Layout', () => {
    test('renders with default responsive grid classes', () => {
      const { container } = render(<ProductGrid products={mockProducts} />);
      const gridElement = container.querySelector('.grid');
      
      expect(gridElement).toHaveClass('grid-cols-1');
      expect(gridElement).toHaveClass('sm:grid-cols-2');
      expect(gridElement).toHaveClass('md:grid-cols-3');
      expect(gridElement).toHaveClass('lg:grid-cols-4');
    });

    test('renders with compact variant grid classes', () => {
      const { container } = render(
        <ProductGrid products={mockProducts} variant="compact" />
      );
      const gridElement = container.querySelector('.grid');
      
      expect(gridElement).toHaveClass('grid-cols-1');
      expect(gridElement).toHaveClass('sm:grid-cols-3');
      expect(gridElement).toHaveClass('md:grid-cols-4');
      expect(gridElement).toHaveClass('lg:grid-cols-5');
      expect(gridElement).toHaveClass('xl:grid-cols-6');
    });

    test('renders with featured variant grid classes', () => {
      const { container } = render(
        <ProductGrid products={mockProducts} variant="featured" />
      );
      const gridElement = container.querySelector('.grid');
      
      expect(gridElement).toHaveClass('grid-cols-1');
      expect(gridElement).toHaveClass('sm:grid-cols-2');
      expect(gridElement).toHaveClass('lg:grid-cols-3');
      expect(gridElement).toHaveClass('xl:grid-cols-4');
    });

    test('respects maxColumns override', () => {
      const { container } = render(
        <ProductGrid products={mockProducts} maxColumns={2} />
      );
      const gridElement = container.querySelector('.grid');
      
      expect(gridElement).toHaveClass('grid-cols-1');
      expect(gridElement).toHaveClass('sm:grid-cols-2');
      expect(gridElement).toHaveClass('lg:grid-cols-2');
    });
  });

  describe('Responsive Spacing', () => {
    test('applies default responsive gap classes', () => {
      const { container } = render(<ProductGrid products={mockProducts} />);
      const gridElement = container.querySelector('.grid');
      
      expect(gridElement).toHaveClass('gap-4');
      expect(gridElement).toHaveClass('sm:gap-5');
      expect(gridElement).toHaveClass('md:gap-6');
      expect(gridElement).toHaveClass('lg:gap-8');
    });

    test('applies compact variant gap classes', () => {
      const { container } = render(
        <ProductGrid products={mockProducts} variant="compact" />
      );
      const gridElement = container.querySelector('.grid');
      
      expect(gridElement).toHaveClass('gap-3');
      expect(gridElement).toHaveClass('sm:gap-4');
      expect(gridElement).toHaveClass('md:gap-5');
      expect(gridElement).toHaveClass('lg:gap-6');
    });

    test('applies featured variant gap classes', () => {
      const { container } = render(
        <ProductGrid products={mockProducts} variant="featured" />
      );
      const gridElement = container.querySelector('.grid');
      
      expect(gridElement).toHaveClass('gap-6');
      expect(gridElement).toHaveClass('sm:gap-8');
      expect(gridElement).toHaveClass('md:gap-10');
      expect(gridElement).toHaveClass('lg:gap-12');
    });
  });

  describe('Product Rendering', () => {
    test('renders all products with correct data', () => {
      render(<ProductGrid products={mockProducts} />);
      
      mockProducts.forEach(product => {
        expect(screen.getByText(product.title)).toBeInTheDocument();
        expect(screen.getByText(`$${product.price.toFixed(2)}`)).toBeInTheDocument();
        expect(screen.getByText(product.description)).toBeInTheDocument();
      });
    });

    test('normalizes product data correctly', () => {
      const productWithImageUrls = {
        id: '5',
        name: 'Product with imageUrls',
        price: '25.50',
        imageUrls: ['/image1.jpg', '/image2.jpg'],
        category: 'Electronics'
      };

      render(<ProductGrid products={[productWithImageUrls]} />);
      
      expect(screen.getByText('Product with imageUrls')).toBeInTheDocument();
      expect(screen.getByText('$25.50')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });

    test('handles missing product data gracefully', () => {
      const incompleteProduct = {
        id: '6'
        // Missing other required fields
      };

      render(<ProductGrid products={[incompleteProduct]} />);
      
      expect(screen.getByText('Untitled Product')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    test('shows default empty state when no products', () => {
      render(<ProductGrid products={[]} />);
      
      expect(screen.getByText('📦')).toBeInTheDocument();
      expect(screen.getByText('No products available')).toBeInTheDocument();
    });

    test('shows custom empty state message', () => {
      render(
        <ProductGrid 
          products={[]} 
          emptyStateMessage="Custom empty message"
          emptyStateIcon="🔍"
        />
      );
      
      expect(screen.getByText('🔍')).toBeInTheDocument();
      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });

    test('hides empty state when showEmptyState is false', () => {
      render(<ProductGrid products={[]} showEmptyState={false} />);
      
      expect(screen.queryByText('📦')).not.toBeInTheDocument();
      expect(screen.queryByText('No products available')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<ProductGrid products={mockProducts} />);
      
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute('aria-label', `Product grid with ${mockProducts.length} items`);
      
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(mockProducts.length);
    });

    test('sets correct aria-rowindex and aria-colindex for mobile', () => {
      useViewport.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isTouchDevice: true,
        width: 375,
        height: 667,
        deviceType: 'mobile'
      });

      render(<ProductGrid products={mockProducts} />);
      
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells[0]).toHaveAttribute('aria-rowindex', '1');
      expect(gridCells[0]).toHaveAttribute('aria-colindex', '1');
      expect(gridCells[1]).toHaveAttribute('aria-rowindex', '2');
      expect(gridCells[1]).toHaveAttribute('aria-colindex', '1');
    });

    test('sets correct aria-rowindex and aria-colindex for tablet', () => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isTouchDevice: true,
        width: 768,
        height: 1024,
        deviceType: 'tablet'
      });

      render(<ProductGrid products={mockProducts} />);
      
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells[0]).toHaveAttribute('aria-rowindex', '1');
      expect(gridCells[0]).toHaveAttribute('aria-colindex', '1');
      expect(gridCells[1]).toHaveAttribute('aria-rowindex', '1');
      expect(gridCells[1]).toHaveAttribute('aria-colindex', '2');
      expect(gridCells[2]).toHaveAttribute('aria-rowindex', '2');
      expect(gridCells[2]).toHaveAttribute('aria-colindex', '1');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      useViewport.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        isTouchDevice: true,
        width: 375,
        height: 667,
        deviceType: 'mobile'
      });
    });

    test('applies mobile-specific styling', () => {
      const { container } = render(<ProductGrid products={mockProducts} />);
      const gridElement = container.querySelector('.grid');
      
      // Should still have responsive classes for progressive enhancement
      expect(gridElement).toHaveClass('grid-cols-1');
      expect(gridElement).toHaveClass('sm:grid-cols-2');
    });

    test('renders responsive empty state on mobile', () => {
      render(<ProductGrid products={[]} />);
      
      const emptyState = screen.getByText('No products available').parentElement;
      expect(emptyState).toHaveClass('py-12');
      expect(emptyState).toHaveClass('sm:py-16');
      expect(emptyState).toHaveClass('lg:py-20');
    });
  });
});