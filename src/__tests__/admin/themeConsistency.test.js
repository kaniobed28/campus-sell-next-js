import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/components/ThemeProvider';
import AdminLayout from '@/components/admin/AdminLayout';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock hooks
jest.mock('@/hooks/useAdminAuth', () => ({
  useAdminAuth: () => ({
    user: { email: 'admin@test.com' },
    adminData: { email: 'admin@test.com', role: 'principal' },
    signOut: jest.fn(),
  }),
}));

jest.mock('@/hooks/useAdminResponsive', () => ({
  useAdminResponsive: () => ({
    isMobile: false,
    isTablet: false,
    mobileMenuOpen: false,
    setMobileMenuOpen: jest.fn(),
    touchConfig: { minTouchTarget: 44 },
    containerClasses: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  }),
}));

describe('Admin Theme Consistency', () => {
  test('AdminLayout uses theme variables instead of hardcoded colors', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AdminLayout title="Test Dashboard">
          <div>Test Content</div>
        </AdminLayout>
      </ThemeProvider>
    );

    // Check that the main container uses bg-background class
    const mainContainer = screen.getByRole('main');
    expect(mainContainer).toHaveClass('min-h-screen');
    expect(mainContainer).toHaveClass('bg-background');

    // Check that header uses bg-background and border-border classes
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-background');
    expect(header).toHaveClass('border-border');
  });

  test('AdminLayout adapts to dark theme', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <AdminLayout title="Test Dashboard">
          <div>Test Content</div>
        </AdminLayout>
      </ThemeProvider>
    );

    // Check that the main container uses bg-background class (should work in dark mode too)
    const mainContainer = screen.getByRole('main');
    expect(mainContainer).toHaveClass('min-h-screen');
    expect(mainContainer).toHaveClass('bg-background');
  });
});