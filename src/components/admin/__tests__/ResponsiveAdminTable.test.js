import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ResponsiveAdminTable from '../ResponsiveAdminTable';
import { useAdminResponsive } from '@/hooks/useAdminResponsive';

// Mock the useAdminResponsive hook
jest.mock('@/hooks/useAdminResponsive');

const mockUseAdminResponsive = useAdminResponsive;

describe('ResponsiveAdminTable', () => {
  const mockData = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      createdAt: '2023-01-01'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'inactive',
      createdAt: '2023-01-02'
    }
  ];

  const mockColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true
    },
    {
      key: 'email',
      label: 'Email'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`status-${value}`}>{value}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button onClick={() => console.log('Edit', row.id)}>
          Edit
        </button>
      )
    }
  ];

  const defaultProps = {
    data: mockData,
    columns: mockColumns,
    loading: false,
    onRowClick: jest.fn(),
    onRowSelect: jest.fn(),
    selectedRows: [],
    showSelection: false,
    emptyMessage: 'No data available'
  };

  beforeEach(() => {
    mockUseAdminResponsive.mockReturnValue({
      isMobile: false,
      isTablet: false,
      tableConfig: {
        showColumns: 'all',
        stackedView: false,
        showPagination: 'full',
        itemsPerPage: 50
      },
      touchConfig: {
        minTouchTarget: 44,
        tapHighlight: false,
        swipeGestures: false,
        longPressActions: false
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop View', () => {
    it('renders table with all columns on desktop', () => {
      render(<ResponsiveAdminTable {...defaultProps} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('displays data in table rows', () => {
      render(<ResponsiveAdminTable {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('renders custom cell content using render function', () => {
      render(<ResponsiveAdminTable {...defaultProps} />);
      
      expect(screen.getByText('active')).toHaveClass('status-active');
      expect(screen.getByText('inactive')).toHaveClass('status-inactive');
    });

    it('handles row selection when showSelection is true', async () => {
      const user = userEvent.setup();
      const onRowSelect = jest.fn();
      
      render(
        <ResponsiveAdminTable 
          {...defaultProps} 
          showSelection={true}
          onRowSelect={onRowSelect}
        />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3); // 2 rows + select all
      
      await user.click(checkboxes[1]); // Click first row checkbox
      expect(onRowSelect).toHaveBeenCalledWith(['1']);
    });

    it('handles select all functionality', async () => {
      const user = userEvent.setup();
      const onRowSelect = jest.fn();
      
      render(
        <ResponsiveAdminTable 
          {...defaultProps} 
          showSelection={true}
          onRowSelect={onRowSelect}
        />
      );
      
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox);
      
      expect(onRowSelect).toHaveBeenCalledWith(['1', '2']);
    });

    it('handles sortable columns', async () => {
      const user = userEvent.setup();
      
      render(<ResponsiveAdminTable {...defaultProps} />);
      
      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveAttribute('role', 'button');
      
      await user.click(nameHeader);
      // Sorting functionality would be tested with actual sort implementation
    });

    it('handles row click events', async () => {
      const user = userEvent.setup();
      const onRowClick = jest.fn();
      
      render(
        <ResponsiveAdminTable 
          {...defaultProps} 
          onRowClick={onRowClick}
        />
      );
      
      const firstRow = screen.getByText('John Doe').closest('tr');
      await user.click(firstRow);
      
      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    });
  });

  describe('Mobile View', () => {
    beforeEach(() => {
      mockUseAdminResponsive.mockReturnValue({
        isMobile: true,
        isTablet: false,
        tableConfig: {
          showColumns: ['main', 'status', 'actions'],
          stackedView: true,
          showPagination: 'simple',
          itemsPerPage: 10
        },
        touchConfig: {
          minTouchTarget: 48,
          tapHighlight: true,
          swipeGestures: true,
          longPressActions: true
        }
      });
    });

    it('renders card view on mobile', () => {
      render(<ResponsiveAdminTable {...defaultProps} />);
      
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('applies touch-friendly styling on mobile', () => {
      render(<ResponsiveAdminTable {...defaultProps} showSelection={true} />);
      
      const cards = screen.getAllByText('John Doe')[0].closest('div');
      expect(cards).toHaveStyle({ minHeight: '48px' });
    });

    it('shows only configured columns in mobile view', () => {
      const filteredColumns = mockColumns.filter(col => 
        ['main', 'status', 'actions'].includes(col.key)
      );
      
      render(
        <ResponsiveAdminTable 
          {...defaultProps} 
          columns={filteredColumns}
        />
      );
      
      // Should show name (main), status, and actions
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  describe('Loading and Empty States', () => {
    it('shows loading state', () => {
      render(<ResponsiveAdminTable {...defaultProps} loading={true} />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // Loading spinner
    });

    it('shows empty state when no data', () => {
      render(<ResponsiveAdminTable {...defaultProps} data={[]} />);
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('shows custom empty message', () => {
      const customMessage = 'No users found';
      render(
        <ResponsiveAdminTable 
          {...defaultProps} 
          data={[]} 
          emptyMessage={customMessage}
        />
      );
      
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for checkboxes', () => {
      render(
        <ResponsiveAdminTable 
          {...defaultProps} 
          showSelection={true}
        />
      );
      
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      expect(selectAllCheckbox).toHaveAttribute('aria-label', 'Select all rows');
      
      const rowCheckboxes = screen.getAllByRole('checkbox').slice(1);
      rowCheckboxes.forEach((checkbox, index) => {
        expect(checkbox).toHaveAttribute('aria-label', `Select row ${index + 1}`);
      });
    });

    it('has proper ARIA sort attributes for sortable columns', () => {
      render(<ResponsiveAdminTable {...defaultProps} />);
      
      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveAttribute('aria-sort', 'none');
    });

    it('supports keyboard navigation for interactive elements', async () => {
      const user = userEvent.setup();
      const onRowClick = jest.fn();
      
      render(
        <ResponsiveAdminTable 
          {...defaultProps} 
          onRowClick={onRowClick}
        />
      );
      
      const firstRow = screen.getByText('John Doe').closest('tr');
      firstRow.focus();
      
      await user.keyboard('{Enter}');
      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
      
      await user.keyboard(' ');
      expect(onRowClick).toHaveBeenCalledTimes(2);
    });

    it('has proper table structure for screen readers', () => {
      render(<ResponsiveAdminTable {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(mockColumns.length);
      
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(mockData.length + 1); // +1 for header row
    });
  });

  describe('Error Handling', () => {
    it('handles missing data gracefully', () => {
      render(<ResponsiveAdminTable {...defaultProps} data={null} />);
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('handles missing columns gracefully', () => {
      render(<ResponsiveAdminTable {...defaultProps} columns={[]} />);
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('handles render function errors gracefully', () => {
      const columnsWithError = [
        {
          key: 'name',
          label: 'Name',
          render: () => {
            throw new Error('Render error');
          }
        }
      ];
      
      // Should not crash the component
      expect(() => {
        render(
          <ResponsiveAdminTable 
            {...defaultProps} 
            columns={columnsWithError}
          />
        );
      }).not.toThrow();
    });
  });
});