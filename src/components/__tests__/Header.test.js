import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';

// Mock the useViewport hook
jest.mock('@/hooks/useViewport', () => ({
  useViewport: jest.fn(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true
  }))
}));

// Mock Firebase auth
jest.mock('@/lib/firebase', () => ({
  auth: {},
}));

// Mock Firebase auth functions
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signOut: jest.fn()
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('Header Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders header with logo', () => {
    render(<Header />);
    expect(screen.getByText('Campus Sell')).toBeInTheDocument();
  });

  test('shows search bar on desktop', () => {
    const { useViewport } = require('@/hooks/useViewport');
    useViewport.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true
    });

    render(<Header />);
    expect(screen.getByPlaceholderText('Search products, categories...')).toBeInTheDocument();
  });

  test('hides search bar and shows search icon on mobile', () => {
    const { useViewport } = require('@/hooks/useViewport');
    useViewport.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    render(<Header />);
    
    // Search bar should not be visible
    expect(screen.queryByPlaceholderText('Search products, categories...')).not.toBeInTheDocument();
    
    // Search icon should be visible
    expect(screen.getByLabelText('Open Search')).toBeInTheDocument();
  });

  test('shows hamburger menu on mobile', () => {
    const { useViewport } = require('@/hooks/useViewport');
    useViewport.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    render(<Header />);
    expect(screen.getByLabelText('Toggle Menu')).toBeInTheDocument();
  });

  test('opens mobile search modal when search icon is clicked', () => {
    const { useViewport } = require('@/hooks/useViewport');
    useViewport.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    render(<Header />);
    
    const searchButton = screen.getByLabelText('Open Search');
    fireEvent.click(searchButton);
    
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Close Search')).toBeInTheDocument();
  });

  test('responsive logo text changes based on screen size', () => {
    const { useViewport } = require('@/hooks/useViewport');
    
    // Test mobile logo
    useViewport.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    const { rerender } = render(<Header />);
    expect(screen.getByText('CS')).toBeInTheDocument();

    // Test desktop logo
    useViewport.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true
    });

    rerender(<Header />);
    expect(screen.getByText('Campus Sell')).toBeInTheDocument();
  });
});