import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { useViewport } from '@/hooks/useViewport';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useViewport hook
jest.mock('@/hooks/useViewport', () => ({
  useViewport: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('SearchBar', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const defaultProps = {
    searchQuery: '',
    setSearchQuery: jest.fn(),
    isSearching: false,
    setIsSearching: jest.fn(),
    products: [
      { id: '1', title: 'Test Product', category: 'Electronics', price: 100 },
      { id: '2', title: 'Another Product', category: 'Books', price: 25 },
    ],
  };

  beforeEach(() => {
    useRouter.mockReturnValue(mockRouter);
    useViewport.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
    });
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('[]');
  });

  it('renders search input and button', () => {
    render(<SearchBar {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('Search products, categories...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('shows suggestions when typing', () => {
    render(<SearchBar {...defaultProps} searchQuery="test" />);
    
    const input = screen.getByPlaceholderText('Search products, categories...');
    fireEvent.focus(input);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('handles search submission', () => {
    const setIsSearching = jest.fn();
    
    render(
      <SearchBar 
        {...defaultProps} 
        searchQuery="test query"
        setIsSearching={setIsSearching}
      />
    );
    
    fireEvent.submit(screen.getByRole('form'));
    
    expect(setIsSearching).toHaveBeenCalledWith(true);
    expect(mockRouter.push).toHaveBeenCalledWith('/search?q=test%20query');
  });

  it('saves search to recent searches', () => {
    render(<SearchBar {...defaultProps} searchQuery="test query" />);
    
    fireEvent.submit(screen.getByRole('form'));
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'recentSearches',
      JSON.stringify(['test query'])
    );
  });

  it('handles suggestion click', () => {
    const setSearchQuery = jest.fn();
    
    render(
      <SearchBar 
        {...defaultProps} 
        searchQuery="test"
        setSearchQuery={setSearchQuery}
      />
    );
    
    const input = screen.getByPlaceholderText('Search products, categories...');
    fireEvent.focus(input);
    
    fireEvent.click(screen.getByText('Test Product'));
    
    expect(setSearchQuery).toHaveBeenCalledWith('Test Product');
    expect(mockRouter.push).toHaveBeenCalledWith('/listings/1');
  });

  it('adapts to mobile viewport', () => {
    useViewport.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isTouchDevice: true,
    });
    
    render(<SearchBar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search products, categories...');
    expect(input).toHaveClass('px-4', 'py-3', 'text-base');
  });

  it('adapts to tablet viewport', () => {
    useViewport.mockReturnValue({
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      isTouchDevice: true,
    });
    
    render(<SearchBar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search products, categories...');
    expect(input).toHaveClass('px-3', 'py-2.5', 'text-sm');
  });

  it('renders compact variant', () => {
    render(<SearchBar {...defaultProps} variant="compact" />);
    
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();
    
    const button = screen.getByRole('button', { name: /search/i });
    expect(button).toBeInTheDocument();
  });

  it('renders modal variant', () => {
    render(<SearchBar {...defaultProps} variant="modal" />);
    
    const input = screen.getByPlaceholderText('Search products, categories...');
    expect(input).toHaveClass('px-4', 'py-3', 'text-base', 'rounded-md');
  });

  it('disables input and button when searching', () => {
    render(<SearchBar {...defaultProps} isSearching={true} />);
    
    const input = screen.getByPlaceholderText('Search products, categories...');
    const button = screen.getByRole('button', { name: /search/i });
    
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('prevents empty search submission', () => {
    render(<SearchBar {...defaultProps} searchQuery="" />);
    
    fireEvent.submit(screen.getByRole('form'));
    
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('closes suggestions when clicking outside', async () => {
    render(<SearchBar {...defaultProps} searchQuery="test" />);
    
    const input = screen.getByPlaceholderText('Search products, categories...');
    fireEvent.focus(input);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
    });
  });

  it('shows touch-friendly suggestion items on mobile', () => {
    useViewport.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isTouchDevice: true,
    });
    
    render(<SearchBar {...defaultProps} searchQuery="test" />);
    
    const input = screen.getByPlaceholderText('Search products, categories...');
    fireEvent.focus(input);
    
    const suggestion = screen.getByText('Test Product').closest('button');
    expect(suggestion).toHaveClass('min-h-[56px]');
  });
});