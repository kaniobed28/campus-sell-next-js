import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import * as auth from '@/lib/auth';
import * as adminAuthService from '@/services/adminAuthService';
import AuthPage from '../page';

// Mock window.alert
window.alert = jest.fn();

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the auth functions
jest.mock('@/lib/auth', () => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
  googleSignIn: jest.fn(),
}));

// Mock the adminAuthService
jest.mock('@/services/adminAuthService', () => ({
  adminAuthService: {
    checkAdminStatus: jest.fn(),
  },
}));

// Mock the child components
jest.mock('../components/AuthForm', () => {
  return function MockAuthForm({ isSignUp, onSubmit, error, loading }) {
    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit('test@example.com', 'password123');
      }}>
        <input type="email" defaultValue="test@example.com" />
        <input type="password" defaultValue="password123" />
        <button type="submit" data-testid="auth-submit-button">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
        {error && <div>{error}</div>}
      </form>
    );
  };
});

jest.mock('../components/GoogleSignInButton', () => {
  return function MockGoogleSignInButton({ onClick, loading }) {
    return <button onClick={onClick} data-testid="google-signin-button">Sign in with Google</button>;
  };
});

jest.mock('../components/AuthToggle', () => {
  return function MockAuthToggle({ isSignUp, onToggle }) {
    return <button onClick={onToggle} data-testid="auth-toggle-button">{isSignUp ? 'Sign In' : 'Sign Up'}</button>;
  };
});

describe('AuthPage', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockUser = {
    email: 'test@example.com',
    uid: '12345',
  };

  beforeEach(() => {
    useRouter.mockReturnValue(mockRouter);
    jest.clearAllMocks();
    window.alert.mockClear();
  });

  describe('handleAuth', () => {
    it('redirects admin users to admin dashboard after sign in', async () => {
      // Mock successful sign in
      auth.signIn.mockResolvedValue(mockUser);
      
      // Mock admin check to return active admin
      adminAuthService.adminAuthService.checkAdminStatus.mockResolvedValue({
        email: mockUser.email,
        isActive: true,
        role: 'admin',
      });

      render(<AuthPage />);
      
      // Trigger sign in
      const submitButton = screen.getByTestId('auth-submit-button');
      fireEvent.click(submitButton);

      // Wait for the redirect
      await waitFor(() => {
        expect(adminAuthService.adminAuthService.checkAdminStatus).toHaveBeenCalledWith('test@example.com');
        expect(mockRouter.push).toHaveBeenCalledWith('/admin');
      });
    });

    it('redirects regular users to previous page after sign in', async () => {
      // Mock successful sign in
      auth.signIn.mockResolvedValue(mockUser);
      
      // Mock admin check to return null (not an admin)
      adminAuthService.adminAuthService.checkAdminStatus.mockResolvedValue(null);

      render(<AuthPage />);
      
      // Trigger sign in
      const submitButton = screen.getByTestId('auth-submit-button');
      fireEvent.click(submitButton);

      // Wait for the redirect
      await waitFor(() => {
        expect(adminAuthService.adminAuthService.checkAdminStatus).toHaveBeenCalledWith('test@example.com');
        expect(mockRouter.back).toHaveBeenCalled();
      });
    });

    it('redirects to home page after sign up for all users', async () => {
      // Mock successful sign up
      auth.signUp.mockResolvedValue(mockUser);

      render(<AuthPage />);
      
      // Switch to sign up mode
      const toggleButton = screen.getByTestId('auth-toggle-button');
      fireEvent.click(toggleButton);

      // Trigger sign up
      const submitButton = screen.getByTestId('auth-submit-button');
      fireEvent.click(submitButton);

      // Wait for the redirect
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('handleGoogleSignIn', () => {
    it('redirects admin users to admin dashboard after Google sign in', async () => {
      // Mock successful Google sign in
      auth.googleSignIn.mockResolvedValue(mockUser);
      
      // Mock admin check to return active admin
      adminAuthService.adminAuthService.checkAdminStatus.mockResolvedValue({
        email: mockUser.email,
        isActive: true,
        role: 'admin',
      });

      render(<AuthPage />);
      
      // Click Google sign in button
      const googleButton = screen.getByTestId('google-signin-button');
      fireEvent.click(googleButton);

      // Wait for the redirect
      await waitFor(() => {
        expect(adminAuthService.adminAuthService.checkAdminStatus).toHaveBeenCalledWith('test@example.com');
        expect(mockRouter.push).toHaveBeenCalledWith('/admin');
      });
    });

    it('redirects regular users to previous page after Google sign in', async () => {
      // Mock successful Google sign in
      auth.googleSignIn.mockResolvedValue(mockUser);
      
      // Mock admin check to return null (not an admin)
      adminAuthService.adminAuthService.checkAdminStatus.mockResolvedValue(null);

      render(<AuthPage />);
      
      // Click Google sign in button
      const googleButton = screen.getByTestId('google-signin-button');
      fireEvent.click(googleButton);

      // Wait for the redirect
      await waitFor(() => {
        expect(adminAuthService.adminAuthService.checkAdminStatus).toHaveBeenCalledWith('test@example.com');
        expect(mockRouter.back).toHaveBeenCalled();
      });
    });
  });
});