import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SearchModal from '@/components/SearchModal';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('SearchModal', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
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
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('[]');
  });

  it('renders when open', () => {
    render(<SearchModal {...defaultProps} />);
    
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search products, categories...')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SearchModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Search')).not.toBeInTheDocument();
  });

  it('focuses input when modal opens', async () => {
    const { rerender } = render(<SearchModal {...defaultProps} isOpen={false} />);
    
    rerender(<SearchModal {...defaultProps} isOpen={true} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search products, categories...')).toHaveFocus();
    });
  });

  it('closes modal when close button is clicked', () => {
    const onClose = jest.fn();
    render(<SearchModal {...defaultProps} onClose={onClose} />);
    
    fireEvent.click(screen.getByLabelText('Close Search'));
    
    expect(onClose).toHaveBeenCalled();
  });

  it('closes modal when escape key is pressed', () => {
    const onClose = jest.fn();
    render(<SearchModal {...defaultProps} onClose={onClose} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalled();
  });

  it('shows suggestions when typing', () => {
    render(<SearchModal {...defaultProps} searchQuery="test" />);
    
    expect(screen.getByText('Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('handles search submission', () => {
    const setIsSearching = jest.fn();
    const onClose = jest.fn();
    
    render(
      <SearchModal 
        {...defaultProps} 
        searchQuery="test query"
        setIsSearching={setIsSearching}
        onClose={onClose}
      />
    );
    
    fireEvent.submit(screen.getByRole('form'));
    
    expect(setIsSearching).toHaveBeenCalledWith(true);
    expect(mockRouter.push).toHaveBeenCalledWith('/search?q=test%20query');
    expect(onClose).toHaveBeenCalled();
  });

  it('saves recent searches', () => {
    render(<SearchModal {...defaultProps} searchQuery="test query" />);
    
    fireEvent.submit(screen.getByRole('form'));
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'recentSearches',
      JSON.stringify(['test query'])
    );
  });

  it('displays recent searches when no query', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(['recent search']));
    
    render(<SearchModal {...defaultProps} />);
    
    expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    expect(screen.getByText('recent search')).toBeInTheDocument();
  });

  it('clears recent searches', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(['recent search']));
    
    render(<SearchModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Clear'));
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('recentSearches');
  });

  it('handles suggestion click', () => {
    const onClose = jest.fn();
    
    render(
      <SearchModal 
        {...defaultProps} 
        searchQuery="test"
        onClose={onClose}
      />
    );
    
    fireEvent.click(screen.getByText('Test Product'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/listings/1');
    expect(onClose).toHaveBeenCalled();
  });

  it('shows empty state when no recent searches', () => {
    render(<SearchModal {...defaultProps} />);
    
    expect(screen.getByText('Start searching')).toBeInTheDocument();
    expect(screen.getByText('Find products, categories, and more')).toBeInTheDocument();
  });

  it('prevents body scroll when open', () => {
    render(<SearchModal {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const { unmount } = render(<SearchModal {...defaultProps} />);
    
    unmount();
    
    expect(document.body.style.overflow).toBe('unset');
  });
});