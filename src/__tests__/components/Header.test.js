import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Header from '@/components/Header';
import { useViewport } from '@/hooks/useViewport';
import { adminAuthService } from '@/services/adminAuthService';

// Mock dependencies
jest.mock('@/hooks/useViewport');
jest.mock('@/services/adminAuthService');
jest.mock('@/lib/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn()
  }
}));

// Mock child components
jest.mock('@/components/SearchBar', () => () => <div data-testid="search-bar">Search Bar</div>);
jest.mock('@/components/SearchModal', () => () => <div data-testid="search-modal">Search Modal</div>);
jest.mock('@/components/NavLinks', () => ({ user, isAdmin }) => (
  <div data-testid="nav-links">
    NavLinks - User: {user ? 'Authenticated' : 'Guest'} - Admin: {isAdmin ? 'Yes' : 'No'}
  </div>
));
jest.mock('@/components/MobileMenu', () => () => <div data-testid="mobile-menu">Mobile Menu</div>);
jest.mock('@/components/DarkModeToggle', () => () => <div data-testid="dark-mode-toggle">Dark Mode Toggle</div>);


// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Header Component', () => {
  beforeEach(() => {
    useViewport.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true
    });
    
    // Mock Firebase auth state
    require('@/lib/firebase').auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(null); // Initially no user
      return () => {}; // unsubscribe function
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders header with logo and navigation for guest user', () => {
    render(<Header />);

    // Check if logo is rendered
    expect(screen.getByText('Campus Sell')).toBeInTheDocument();
    
    // Check if navigation links are rendered
    expect(screen.getByTestId('nav-links')).toBeInTheDocument();
    
    // Check if dark mode toggle is rendered
    expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument();
    

  });

  test('shows admin dashboard link for admin users', async () => {
    // Mock admin status check
    adminAuthService.checkAdminStatus.mockResolvedValue({
      email: 'admin@example.com',
      role: 'admin',
      isActive: true
    });

    // Mock authenticated user
    require('@/lib/firebase').auth.onAuthStateChanged.mockImplementation((callback) => {
      callback({ email: 'admin@example.com' }); // Authenticated admin user
      return () => {};
    });

    render(<Header />);

    // Wait for admin status check to complete
    await waitFor(() => {
      expect(screen.getByTestId('nav-links')).toHaveTextContent('Admin: Yes');
    });
  });

  test('does not show admin dashboard link for non-admin users', async () => {
    // Mock non-admin status
    adminAuthService.checkAdminStatus.mockResolvedValue(null);

    // Mock authenticated user
    require('@/lib/firebase').auth.onAuthStateChanged.mockImplementation((callback) => {
      callback({ email: 'user@example.com' }); // Authenticated non-admin user
      return () => {};
    });

    render(<Header />);

    // Wait for admin status check to complete
    await waitFor(() => {
      expect(screen.getByTestId('nav-links')).toHaveTextContent('Admin: No');
    });
  });
});