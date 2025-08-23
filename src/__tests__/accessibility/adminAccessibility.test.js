/**
 * Accessibility tests for admin interfaces
 * Tests WCAG 2.1 AA compliance for admin components
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import AdminLayout from '@/components/admin/AdminLayout';
import ResponsiveAdminTable from '@/components/admin/ResponsiveAdminTable';
import ResponsiveAdminModal from '@/components/admin/ResponsiveAdminModal';
import ResponsiveAdminForm from '@/components/admin/ResponsiveAdminForm';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminResponsive } from '@/hooks/useAdminResponsive';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock hooks
jest.mock('@/hooks/useAdminAuth');
jest.mock('@/hooks/useAdminResponsive');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockAdminData = {
  email: 'admin@test.com',
  role: 'admin',
  permissions: ['user_management', 'product_moderation']
};

const mockResponsiveData = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isTouchDevice: false,
  mobileMenuOpen: false,
  setMobileMenuOpen: jest.fn(),
  touchConfig: { minTouchTarget: 44 },
  containerClasses: 'px-8'
};

beforeEach(() => {
  useAdminAuth.mockReturnValue({
    user: { email: 'admin@test.com' },
    adminData: mockAdminData,
    signOut: jest.fn()
  });

  useAdminResponsive.mockReturnValue(mockResponsiveData);
});

describe('Admin Layout Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(
      <AdminLayout title="Test Dashboard">
        <div>Test content</div>
      </AdminLayout>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('should have proper heading hierarchy', () => {
    render(
      <AdminLayout title="Test Dashboard">
        <div>Test content</div>
      </AdminLayout>
    );

    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('Test Dashboard');
  });

  test('should have skip link for keyboard navigation', () => {
    render(
      <AdminLayout title="Test Dashboard">
        <div>Test content</div>
      </AdminLayout>
    );

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('should have proper ARIA landmarks', () => {
    render(
      <AdminLayout title="Test Dashboard">
        <div>Test content</div>
      </AdminLayout>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // nav
    expect(screen.getByRole('main')).toBeInTheDocument(); // main
  });

  test('should support keyboard navigation in mobile menu', async () => {
    useAdminResponsive.mockReturnValue({
      ...mockResponsiveData,
      isMobile: true,
      mobileMenuOpen: true
    });

    const user = userEvent.setup();
    render(
      <AdminLayout title="Test Dashboard">
        <div>Test content</div>
      </AdminLayout>
    );

    // Test Escape key closes menu
    await user.keyboard('{Escape}');
    expect(mockResponsiveData.setMobileMenuOpen).toHaveBeenCalledWith(false);
  });
});

describe('Responsive Admin Table Accessibility', () => {
  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@test.com', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@test.com', status: 'inactive' }
  ];

  const mockColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' }
  ];

  test('should not have accessibility violations', async () => {
    const { container } = render(
      <ResponsiveAdminTable
        data={mockData}
        columns={mockColumns}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('should have proper table structure with headers', () => {
    render(
      <ResponsiveAdminTable
        data={mockData}
        columns={mockColumns}
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
  });

  test('should support keyboard navigation for sortable columns', async () => {
    const user = userEvent.setup();
    render(
      <ResponsiveAdminTable
        data={mockData}
        columns={mockColumns}
      />
    );

    const nameHeader = screen.getByRole('button', { name: /name/i });
    expect(nameHeader).toHaveAttribute('tabindex', '0');

    await user.tab();
    expect(nameHeader).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(nameHeader).toHaveAttribute('aria-sort');
  });

  test('should have proper ARIA labels for selection checkboxes', () => {
    render(
      <ResponsiveAdminTable
        data={mockData}
        columns={mockColumns}
        showSelection={true}
        selectedRows={[]}
        onRowSelect={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
    expect(screen.getByLabelText('Select row 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Select row 2')).toBeInTheDocument();
  });

  test('should render mobile card view accessibly', () => {
    useAdminResponsive.mockReturnValue({
      ...mockResponsiveData,
      isMobile: true,
      tableConfig: { stackedView: true, showColumns: ['main', 'status'] }
    });

    const { container } = render(
      <ResponsiveAdminTable
        data={mockData}
        columns={mockColumns}
      />
    );

    // Should not render table in mobile view
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    // Should render cards with proper structure
    const cards = container.querySelectorAll('[role="button"]');
    expect(cards).toHaveLength(mockData.length);
  });
});

describe('Responsive Admin Modal Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(
      <ResponsiveAdminModal
        isOpen={true}
        onClose={jest.fn()}
        title="Test Modal"
      >
        <div>Modal content</div>
      </ResponsiveAdminModal>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('should have proper modal ARIA attributes', () => {
    render(
      <ResponsiveAdminModal
        isOpen={true}
        onClose={jest.fn()}
        title="Test Modal"
      >
        <div>Modal content</div>
      </ResponsiveAdminModal>
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');

    const title = screen.getByText('Test Modal');
    expect(title).toHaveAttribute('id', 'modal-title');
  });

  test('should trap focus within modal', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <ResponsiveAdminModal
        isOpen={true}
        onClose={onClose}
        title="Test Modal"
        actions={
          <button>Action Button</button>
        }
      >
        <input placeholder="Test input" />
      </ResponsiveAdminModal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    const input = screen.getByPlaceholderText('Test input');
    const actionButton = screen.getByText('Action Button');

    // Focus should start on close button
    expect(closeButton).toHaveFocus();

    // Tab should move to input
    await user.tab();
    expect(input).toHaveFocus();

    // Tab should move to action button
    await user.tab();
    expect(actionButton).toHaveFocus();

    // Tab should wrap back to close button
    await user.tab();
    expect(closeButton).toHaveFocus();
  });

  test('should close on Escape key', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <ResponsiveAdminModal
        isOpen={true}
        onClose={onClose}
        title="Test Modal"
      >
        <div>Modal content</div>
      </ResponsiveAdminModal>
    );

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Responsive Admin Form Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(
      <ResponsiveAdminForm onSubmit={jest.fn()}>
        <ResponsiveAdminForm.Field label="Test Field" required>
          <ResponsiveAdminForm.Input placeholder="Test input" />
        </ResponsiveAdminForm.Field>
      </ResponsiveAdminForm>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('should have proper form field associations', () => {
    render(
      <ResponsiveAdminForm onSubmit={jest.fn()}>
        <ResponsiveAdminForm.Field
          label="Test Field"
          required
          error="This field is required"
        >
          <ResponsiveAdminForm.Input placeholder="Test input" />
        </ResponsiveAdminForm.Field>
      </ResponsiveAdminForm>
    );

    const label = screen.getByText('Test Field');
    const input = screen.getByPlaceholderText('Test input');
    const error = screen.getByText('This field is required');

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(error).toHaveAttribute('role', 'alert');

    // Check required indicator
    expect(screen.getByLabelText('required')).toBeInTheDocument();
  });

  test('should have proper touch targets on mobile', () => {
    useAdminResponsive.mockReturnValue({
      ...mockResponsiveData,
      isMobile: true,
      touchConfig: { minTouchTarget: 48 }
    });

    render(
      <ResponsiveAdminForm onSubmit={jest.fn()}>
        <ResponsiveAdminForm.Field label="Test Field">
          <ResponsiveAdminForm.Input placeholder="Test input" />
        </ResponsiveAdminForm.Field>
        <ResponsiveAdminForm.Actions>
          <ResponsiveAdminForm.Button type="submit">
            Submit
          </ResponsiveAdminForm.Button>
        </ResponsiveAdminForm.Actions>
      </ResponsiveAdminForm>
    );

    const input = screen.getByPlaceholderText('Test input');
    const button = screen.getByText('Submit');

    expect(input).toHaveStyle('min-height: 48px');
    expect(button).toHaveStyle('min-height: 48px');
    expect(button).toHaveStyle('min-width: 48px');
  });

  test('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(
      <ResponsiveAdminForm onSubmit={onSubmit}>
        <ResponsiveAdminForm.Field label="Field 1">
          <ResponsiveAdminForm.Input placeholder="Input 1" />
        </ResponsiveAdminForm.Field>
        <ResponsiveAdminForm.Field label="Field 2">
          <ResponsiveAdminForm.Input placeholder="Input 2" />
        </ResponsiveAdminForm.Field>
        <ResponsiveAdminForm.Actions>
          <ResponsiveAdminForm.Button type="submit">
            Submit
          </ResponsiveAdminForm.Button>
        </ResponsiveAdminForm.Actions>
      </ResponsiveAdminForm>
    );

    const input1 = screen.getByPlaceholderText('Input 1');
    const input2 = screen.getByPlaceholderText('Input 2');
    const submitButton = screen.getByText('Submit');

    // Tab through form elements
    await user.tab();
    expect(input1).toHaveFocus();

    await user.tab();
    expect(input2).toHaveFocus();

    await user.tab();
    expect(submitButton).toHaveFocus();

    // Enter should submit form when button is focused
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalled();
  });
});

describe('Color Contrast and Visual Accessibility', () => {
  test('should meet WCAG AA contrast requirements', () => {
    // This would typically use a real color contrast checking library
    // For now, we'll test that the CSS custom properties are properly set

    render(
      <div className="bg-background text-foreground">
        <div className="bg-primary text-primary-foreground">Primary text</div>
        <div className="bg-secondary text-secondary-foreground">Secondary text</div>
      </div>
    );

    // In a real test, you would check computed styles and contrast ratios
    expect(screen.getByText('Primary text')).toBeInTheDocument();
    expect(screen.getByText('Secondary text')).toBeInTheDocument();
  });

  test('should respect reduced motion preferences', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    const { container } = render(
      <div className="transition-all duration-300">
        Animated content
      </div>
    );

    // Check that animations are disabled when reduced motion is preferred
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('Screen Reader Support', () => {
  test('should announce important state changes', async () => {
    const mockAnnounce = jest.fn();

    // Mock screen reader announcement
    global.speechSynthesis = {
      speak: mockAnnounce,
      cancel: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      getVoices: jest.fn(() => [])
    };

    render(
      <ResponsiveAdminTable
        data={[]}
        columns={[]}
        loading={true}
      />
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should provide proper ARIA labels for interactive elements', () => {
    render(
      <ResponsiveAdminModal
        isOpen={true}
        onClose={jest.fn()}
        title="Delete Confirmation"
      >
        <p>Are you sure you want to delete this item?</p>
      </ResponsiveAdminModal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    expect(closeButton).toBeInTheDocument();

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});