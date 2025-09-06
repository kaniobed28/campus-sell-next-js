"use client";

import React, { useState } from 'react';
import { useAdminResponsive } from '@/hooks/useAdminResponsive';

const ResponsiveAdminTable = ({
  data = [],
  columns = [],
  loading = false,
  onRowClick = null,
  onRowSelect = null,
  selectedRows = [],
  showSelection = false,
  emptyMessage = "No data available",
  className = ""
}) => {
  const { isMobile, isTablet, tableConfig, touchConfig } = useAdminResponsive();
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked) => {
    if (onRowSelect) {
      const allIds = data.map(row => row.id);
      onRowSelect(checked ? allIds : []);
    }
  };

  const handleRowSelect = (rowId, checked) => {
    if (onRowSelect) {
      const newSelection = checked
        ? [...selectedRows, rowId]
        : selectedRows.filter(id => id !== rowId);
      onRowSelect(newSelection);
    }
  };

  const getVisibleColumns = () => {
    if (tableConfig.showColumns === 'all') {
      return columns;
    }
    return columns.filter(col => tableConfig.showColumns.includes(col.key));
  };

  const visibleColumns = getVisibleColumns();

  if (loading) {
    return (
      <div className={`bg-card rounded-lg shadow overflow-hidden ${className}`}>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-card rounded-lg shadow overflow-hidden ${className}`}>
        <div className="p-6 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  // Mobile card view
  if (isMobile && tableConfig.stackedView) {
    return (
      <div className={`space-y-4 ${className}`}>
        {data.map((row, index) => (
          <div
            key={row.id || index}
            className={`bg-card rounded-lg shadow p-4 border border-border ${
              onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
            }`}
            onClick={() => onRowClick && onRowClick(row)}
            style={{ minHeight: touchConfig.minTouchTarget }}
          >
            {showSelection && (
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(row.id)}
                  onChange={(e) => handleRowSelect(row.id, e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                  style={{ 
                    minWidth: touchConfig.minTouchTarget,
                    minHeight: touchConfig.minTouchTarget 
                  }}
                  aria-label={`Select ${row.id}`}
                />
              </div>
            )}
            
            <div className="space-y-2">
              {visibleColumns.map((column) => (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-muted-foreground min-w-0 flex-shrink-0 mr-3">
                    {column.label}:
                  </span>
                  <div className="text-sm text-foreground text-right min-w-0 flex-1">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop/tablet table view
  return (
    <div className={`bg-card rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              {showSelection && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-muted/80' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                  role={column.sortable ? 'button' : undefined}
                  tabIndex={column.sortable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(column.key);
                    }
                  }}
                  aria-sort={
                    sortColumn === column.key
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <svg
                          className={`w-3 h-3 ${
                            sortColumn === column.key && sortDirection === 'asc'
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {data.map((row, index) => (
              <tr
                key={row.id || index}
                className={`${
                  onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''
                } transition-colors`}
                onClick={() => onRowClick && onRowClick(row)}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
              >
                {showSelection && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => handleRowSelect(row.id, e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                      aria-label={`Select row ${index + 1}`}
                    />
                  </td>
                )}
                {visibleColumns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      column.key === 'actions' ? 'text-right' : 'text-foreground'
                    }`}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponsiveAdminTable;