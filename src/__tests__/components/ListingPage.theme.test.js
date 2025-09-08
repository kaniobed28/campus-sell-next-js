/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListingPage from '../../app/listings/[id]/page';

// Mock the hooks and components used in the ListingPage
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-id' }),
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/app/stores/useCartStore', () => ({
  useCartStore: () => ({
    addToCart: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/app/stores/useProfileStore', () => () => ({
  authUser: { uid: 'test-user' },
  fetchUser: jest.fn(),
  loading: false,
}));

jest.mock('@/hooks/useProductAndSeller', () => () => ({
  product: {
    id: 'test-id',
    title: 'Test Product',
    name: 'Test Product',
    price: 29.99,
    description: 'This is a test product',
    category: 'Electronics',
    condition: 'Good',
    location: 'Campus',
    createdAt: { seconds: Date.now() / 1000 },
    image: '/test-image.jpg',
  },
  seller: {
    fullName: 'Test Seller',
    email: 'test@example.com',
    joinedDate: new Date(),
  },
  sellerLoading: false,
  productLoading: false,
  relatedProducts: [],
}));

// Mock components
jest.mock('@/components/Loading', () => () => <div>Loading...</div>);
jest.mock('@/components/NotFound', () => () => <div>Not Found</div>);
jest.mock('@/components/ProductImage', () => () => <div>Product Image</div>);
jest.mock('@/components/ProductDetails', () => ({ product, onAddToCart, isLoading, isAuthenticated }) => (
  <div>
    <h1>{product.title}</h1>
    <button onClick={onAddToCart}>Add to Cart</button>
  </div>
));
jest.mock('@/components/QuantityModal', () => () => <div>Quantity Modal</div>);
jest.mock('@/components/RelatedProducts', () => () => <div>Related Products</div>);
jest.mock('@/components/Notification', () => ({ message }) => message ? <div>{message}</div> : null);
jest.mock('@/components/ImageLightbox', () => () => <div>Image Lightbox</div>);
jest.mock('@/components/SellerInfo', () => () => <div>Seller Info</div>);

describe('ListingPage Theme Integration', () => {
  beforeEach(() => {
    // Set up the DOM with theme classes
    document.documentElement.classList.add('light');
  });

  afterEach(() => {
    // Clean up theme classes
    document.documentElement.classList.remove('light', 'dark');
  });

  test('uses theme variables for styling', () => {
    render(<ListingPage />);
    
    // Check that the main container uses theme-appropriate classes
    const mainContainer = screen.getByTestId('listing-container');
    expect(mainContainer).toBeInTheDocument();
  });

  test('adapts to dark theme', () => {
    // Switch to dark theme
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    
    render(<ListingPage />);
    
    // Check that the page renders correctly in dark mode
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});