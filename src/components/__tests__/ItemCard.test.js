import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemCard from '../ItemCard';
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

// Mock ResponsiveImageContainer
jest.mock('../ResponsiveImageContainer', () => ({
  ProductImageContainer: ({ src, alt, className, containerClassName }) => (
    <div className={containerClassName}>
      <img src={src} alt={alt} className={className} />
    </div>
  )
}));

// Mock Button component
jest.mock('../ui/Button', () => ({
  Button: ({ children, asChild, className, ...props }) => {
    if (asChild) {
      return React.cloneElement(children, { className, ...props });
    }
    return <button className={className} {...props}>{children}</button>;
  }
}));

const mockProduct = {
  id: '1',
  image: '/test-image.jpg',
  title: 'Test Product',
  description: 'Test description',
  price: '29.99',
  link: '/listings/1',
  likes: 15,
  views: 120
};

describe('ItemCard Component', () => {
  beforeEach(() => {
    // Default desktop viewport
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

  describe('Basic Rendering', () => {
    test('renders product information correctly', () => {
      render(<ItemCard {...mockProduct} />);
      
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', '/listings/1');
    });

    test('renders with proper accessibility attributes', () => {
      render(<ItemCard {...mockProduct} />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-labelledby', 'product-title-1');
      
      const title = screen.getByRole('heading');
      expect(title).toHaveAttribute('id', 'product-title-1');
    });

    test('renders product image with correct attributes', () => {
      render(<ItemCard {...mockProduct} />);
      
      const image = screen.getByAltText('Test Product');
      expect(image).toHaveAttribute('src', '/test-image.jpg');
    });
  });

  describe('Variant Configurations', () => {
    test('renders default variant correctly', () => {
      const { container } = render(<ItemCard {...mockProduct} />);
      
      const card = container.querySelector('article');
      expect(card).toHaveClass('p-3', 'sm:p-4');
      
      const title = screen.getByRole('heading');
      expect(title).toHaveClass('text-base', 'sm:text-lg');
      
      const price = screen.getByText('$29.99');
      expect(price).toHaveClass('text-lg', 'sm:text-xl');
    });

    test('renders compact variant correctly', () => {
      const { container } = render(<ItemCard {...mockProduct} variant="compact" />);
      
      const card = container.querySelector('article');
      expect(card).toHaveClass('p-2', 'sm:p-3');
      
      const title = screen.getByRole('heading');
      expect(title).toHaveClass('text-sm', 'sm:text-base');
      
      const price = screen.getByText('$29.99');
      expect(price).toHaveClass('text-base', 'sm:text-lg');
      
      // Compact variant should not show description and stats
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
      expect(screen.queryByText('15')).not.toBeInTheDocument();
    });

    test('renders featured variant correctly', () => {
      const { container } = render(<ItemCard {...mockProduct} variant="featured" />);
      
      const card = container.querySelector('article');
      expect(card).toHaveClass('p-4', 'sm:p-5', 'md:p-6');
      
      const title = screen.getByRole('heading');
      expect(title).toHaveClass('text-lg', 'sm:text-xl', 'md:text-2xl');
      
      const price = screen.getByText('$29.99');
      expect(price).toHaveClass('text-xl', 'sm:text-2xl', 'md:text-3xl');
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
      const { container } = render(<ItemCard {...mockProduct} />);
      
      const card = container.querySelector('article');
      expect(card).toHaveClass('active:scale-[0.98]');
    });

    test('shows abbreviated stats on mobile for large numbers', () => {
      const productWithLargeStats = {
        ...mockProduct,
        likes: 1500,
        views: 12000
      };
      
      render(<ItemCard {...productWithLargeStats} />);
      
      expect(screen.getByText('1k')).toBeInTheDocument(); // likes
      expect(screen.getByText('12k')).toBeInTheDocument(); // views
    });

    test('applies touch-friendly button sizing', () => {
      render(<ItemCard {...mockProduct} />);
      
      const button = screen.getByRole('link');
      expect(button).toHaveClass('min-h-[44px]');
    });
  });

  describe('Tablet Responsiveness', () => {
    beforeEach(() => {
      useViewport.mockReturnValue({
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isTouchDevice: true,
        width: 768,
        height: 1024,
        deviceType: 'tablet'
      });
    });

    test('applies tablet-specific styling', () => {
      const { container } = render(<ItemCard {...mockProduct} />);
      
      const card = container.querySelector('article');
      expect(card).toHaveClass('active:scale-[0.98]'); // Touch device styling
    });
  });

  describe('Desktop Responsiveness', () => {
    test('applies desktop-specific styling', () => {
      const { container } = render(<ItemCard {...mockProduct} />);
      
      const card = container.querySelector('article');
      expect(card).not.toHaveClass('active:scale-[0.98]'); // No touch styling
    });

    test('shows full stats text on desktop', () => {
      render(<ItemCard {...mockProduct} />);
      
      expect(screen.getByText('15 Likes')).toBeInTheDocument();
      expect(screen.getByText('120 Views')).toBeInTheDocument();
    });

    test('shows arrow icon in featured variant button on desktop', () => {
      render(<ItemCard {...mockProduct} variant="featured" />);
      
      const button = screen.getByRole('link');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Image Sizing', () => {
    test('applies correct image height classes for default variant', () => {
      const { container } = render(<ItemCard {...mockProduct} />);
      
      const image = container.querySelector('img');
      expect(image).toHaveClass('h-32', 'sm:h-40', 'md:h-48', 'lg:h-44');
    });

    test('applies correct image height classes for compact variant', () => {
      const { container } = render(<ItemCard {...mockProduct} variant="compact" />);
      
      const image = container.querySelector('img');
      expect(image).toHaveClass('h-24', 'sm:h-32', 'md:h-36', 'lg:h-32');
    });

    test('applies correct image height classes for featured variant', () => {
      const { container } = render(<ItemCard {...mockProduct} variant="featured" />);
      
      const image = container.querySelector('img');
      expect(image).toHaveClass('h-40', 'sm:h-48', 'md:h-56', 'lg:h-48');
    });
  });

  describe('Interactive States', () => {
    test('applies hover effects', () => {
      const { container } = render(<ItemCard {...mockProduct} />);
      
      const card = container.querySelector('article');
      expect(card).toHaveClass('hover:shadow-md', 'hover:shadow-primary/10');
      expect(card).toHaveClass('hover:border-primary/20');
      expect(card).toHaveClass('hover:bg-card');
    });

    test('applies group hover effects to image', () => {
      const { container } = render(<ItemCard {...mockProduct} />);
      
      const image = container.querySelector('img');
      expect(image).toHaveClass('group-hover:scale-105');
    });

    test('applies group hover effects to title', () => {
      render(<ItemCard {...mockProduct} />);
      
      const title = screen.getByRole('heading');
      expect(title).toHaveClass('group-hover:text-primary');
    });
  });

  describe('Content Handling', () => {
    test('handles missing description gracefully', () => {
      const productWithoutDescription = {
        ...mockProduct,
        description: null
      };
      
      render(<ItemCard {...productWithoutDescription} />);
      
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });

    test('truncates long titles with line-clamp', () => {
      const productWithLongTitle = {
        ...mockProduct,
        title: 'This is a very long product title that should be truncated'
      };
      
      render(<ItemCard {...productWithLongTitle} />);
      
      const title = screen.getByRole('heading');
      expect(title).toHaveClass('line-clamp-2');
    });

    test('truncates long descriptions with line-clamp', () => {
      const productWithLongDescription = {
        ...mockProduct,
        description: 'This is a very long product description that should be truncated to fit within the card layout'
      };
      
      render(<ItemCard {...productWithLongDescription} />);
      
      const description = screen.getByText(productWithLongDescription.description);
      expect(description).toHaveClass('line-clamp-2');
    });
  });
});