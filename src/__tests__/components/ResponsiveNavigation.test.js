/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MobileMenu from '../../components/MobileMenu';
import NavLinks from '../../components/NavLinks';
import Header from '../../components/Header';

// Mock the hooks and Firebase
jest.mock('../../hooks/useViewport', () => ({
  useViewport: () => ({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: true,
    width: 375,
    height: 667,
    deviceType: 'mobile'
  })
}));

jest.mock('../../lib/firebase', () => ({
  auth: {},
  db: {}
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signOut: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Mock FontAwesome icons
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }) => (
    <span data-testid="icon" className={className}>
      {icon.iconName || 'icon'}
    </span>
  )
}));

describe('Responsive Navigation System', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com'
  };

  const mockProps = {
    isMenuOpen: true,
    setIsMenuOpen: jest.fn(),
    user: mockUser,
    handleSignOut: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MobileMenu Component', () => {
    test('renders with proper accessibility attributes', () => {
      render(<MobileMenu {...mockProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'mobile-menu-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'mobile-menu-description');
    });

    test('has proper touch targets (minimum 48px)', () => {
      render(<MobileMenu {...mockProps} />);
      
      const closeButton = screen.getByLabelText('Close navigation menu');
      expect(closeButton).toHaveClass('min-w-[48px]', 'min-h-[48px]');
    });

    test('handles keyboard navigation correctly', async () => {
      const user = userEvent.setup();
      render(<MobileMenu {...mockProps} />);
      
      // Test Escape key closes menu
      await user.keyboard('{Escape}');
      expect(mockProps.setIsMenuOpen).toHaveBeenCalledWith(false);
    });

    test('traps focus within menu when open', async () => {
      render(<MobileMenu {...mockProps} />);
      
      const closeButton = screen.getByLabelText('Close navigation menu');
      const menuLinks = screen.getAllByRole('link');
      
      // Focus should be trapped within the menu
      expect(document.activeElement).toBe(closeButton);
    });

    test('prevents body scroll when open', () => {
      render(<MobileMenu {...mockProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    test('restores body scroll when closed', () => {
      const { rerender } = render(<MobileMenu {...mockProps} />);
      
      rerender(<MobileMenu {...mockProps} isMenuOpen={false} />);
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('NavLinks Component', () => {
    test('renders with proper mobile styling and touch targets', () => {
      render(
        <NavLinks 
          user={mockUser} 
          handleSignOut={jest.fn()} 
          onLinkClick={jest.fn()} 
          isMobile={true} 
        />
      );
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass('min-h-[48px]');
      });
    });

    test('includes icons in mobile view', () => {
      render(
        <NavLinks 
          user={mockUser} 
          handleSignOut={jest.fn()} 
          onLinkClick={jest.fn()} 
          isMobile={true} 
        />
      );
      
      const icons = screen.getAllByTestId('icon');
      expect(icons.length).toBeGreaterThan(0);
    });

    test('renders different styles for desktop', () => {
      render(
        <NavLinks 
          user={mockUser} 
          handleSignOut={jest.fn()} 
          onLinkClick={jest.fn()} 
          isMobile={false} 
        />
      );
      
      const categoriesLink = screen.getByText('Categories');
      expect(categoriesLink).not.toHaveClass('min-h-[48px]');
    });

    test('handles user authentication states correctly', () => {
      // Test with authenticated user
      render(
        <NavLinks 
          user={mockUser} 
          handleSignOut={jest.fn()} 
          onLinkClick={jest.fn()} 
          isMobile={true} 
        />
      );
      
      expect(screen.getByText('Sell')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    test('shows sign in for unauthenticated users', () => {
      render(
        <NavLinks 
          user={null} 
          handleSignOut={jest.fn()} 
          onLinkClick={jest.fn()} 
          isMobile={true} 
        />
      );
      
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.queryByText('Sell')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    });

    test('calls onLinkClick when links are clicked', async () => {
      const mockOnLinkClick = jest.fn();
      const user = userEvent.setup();
      
      render(
        <NavLinks 
          user={mockUser} 
          handleSignOut={jest.fn()} 
          onLinkClick={mockOnLinkClick} 
          isMobile={true} 
        />
      );
      
      const categoriesLink = screen.getByText('Categories');
      await user.click(categoriesLink);
      
      expect(mockOnLinkClick).toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    test('adapts touch targets based on device type', () => {
      render(
        <NavLinks 
          user={mockUser} 
          handleSignOut={jest.fn()} 
          onLinkClick={jest.fn()} 
          isMobile={true} 
        />
      );
      
      const sellButton = screen.getByText('Sell');
      expect(sellButton).toHaveClass('min-h-[48px]');
    });

    test('provides hover effects on non-touch devices', () => {
      // This would require more complex mocking of touch detection
      // For now, we verify the hover classes are present
      render(
        <NavLinks 
          user={mockUser} 
          handleSignOut={jest.fn()} 
          onLinkClick={jest.fn()} 
          isMobile={false} 
        />
      );
      
      const categoriesLink = screen.getByText('Categories');
      expect(categoriesLink).toHaveClass('hover:text-accent');
    });
  });

  describe('Animation and Transitions', () => {
    test('includes proper transition classes', () => {
      render(<MobileMenu {...mockProps} />);
      
      const menuPanel = screen.getByRole('dialog');
      expect(menuPanel).toHaveClass('transition-all', 'duration-300', 'ease-out');
    });

    test('includes scale animations for touch feedback', () => {
      render(
        <NavLinks 
          user={mockUser} 
          handleSignOut={jest.fn()} 
          onLinkClick={jest.fn()} 
          isMobile={true} 
        />
      );
      
      const sellButton = screen.getByText('Sell');
      expect(sellButton).toHaveClass('hover:scale-[1.02]', 'active:scale-[0.98]');
    });
  });

  describe('Focus Management', () => {
    test('manages focus properly when menu opens and closes', async () => {
      const { rerender } = render(<MobileMenu {...mockProps} isMenuOpen={false} />);
      
      // Mock the hamburger button
      const hamburgerButton = document.createElement('button');
      hamburgerButton.setAttribute('aria-label', 'Toggle Menu');
      document.body.appendChild(hamburgerButton);
      
      rerender(<MobileMenu {...mockProps} isMenuOpen={true} />);
      
      // Focus should move to close button when menu opens
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close navigation menu');
        expect(document.activeElement).toBe(closeButton);
      });
      
      document.body.removeChild(hamburgerButton);
    });
  });
});