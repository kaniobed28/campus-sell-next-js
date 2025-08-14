"use client";

import { useState, useEffect, useCallback } from 'react';
import { useViewport } from './useViewport';

/**
 * Custom hook for admin-specific responsive behavior
 * Provides utilities for admin interface mobile optimization
 */
export const useAdminResponsive = () => {
  const { isMobile, isTablet, isDesktop, width, isTouchDevice } = useViewport();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-collapse sidebar on mobile/tablet
  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [isMobile, isTablet]);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (isDesktop) {
      setMobileMenuOpen(false);
    }
  }, [isDesktop]);

  // Admin-specific responsive configurations
  const getTableConfig = useCallback(() => {
    if (isMobile) {
      return {
        showColumns: ['main', 'status', 'actions'],
        stackedView: true,
        showPagination: 'simple',
        itemsPerPage: 10
      };
    } else if (isTablet) {
      return {
        showColumns: ['main', 'status', 'date', 'actions'],
        stackedView: false,
        showPagination: 'full',
        itemsPerPage: 25
      };
    } else {
      return {
        showColumns: 'all',
        stackedView: false,
        showPagination: 'full',
        itemsPerPage: 50
      };
    }
  }, [isMobile, isTablet]);

  const getModalConfig = useCallback(() => {
    if (isMobile) {
      return {
        fullScreen: true,
        position: 'bottom',
        animation: 'slide-up'
      };
    } else if (isTablet) {
      return {
        fullScreen: false,
        position: 'center',
        animation: 'fade-scale',
        maxWidth: '90vw'
      };
    } else {
      return {
        fullScreen: false,
        position: 'center',
        animation: 'fade-scale',
        maxWidth: '4xl'
      };
    }
  }, [isMobile, isTablet]);

  const getFormConfig = useCallback(() => {
    if (isMobile) {
      return {
        layout: 'stacked',
        columns: 1,
        spacing: 'compact',
        stickyActions: true
      };
    } else if (isTablet) {
      return {
        layout: 'grid',
        columns: 2,
        spacing: 'normal',
        stickyActions: false
      };
    } else {
      return {
        layout: 'grid',
        columns: 3,
        spacing: 'comfortable',
        stickyActions: false
      };
    }
  }, [isMobile, isTablet]);

  const getNavigationConfig = useCallback(() => {
    if (isMobile) {
      return {
        type: 'bottom-tabs',
        showLabels: false,
        collapsible: false
      };
    } else if (isTablet) {
      return {
        type: 'sidebar',
        showLabels: true,
        collapsible: true,
        collapsed: sidebarCollapsed
      };
    } else {
      return {
        type: 'sidebar',
        showLabels: true,
        collapsible: true,
        collapsed: sidebarCollapsed
      };
    }
  }, [isMobile, isTablet, sidebarCollapsed]);

  // Touch-friendly configurations
  const getTouchConfig = useCallback(() => {
    return {
      minTouchTarget: isTouchDevice ? 48 : 36,
      tapHighlight: isTouchDevice,
      swipeGestures: isMobile,
      longPressActions: isTouchDevice
    };
  }, [isTouchDevice, isMobile]);

  return {
    // Device detection
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    width,

    // State management
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,

    // Configuration getters
    tableConfig: getTableConfig(),
    modalConfig: getModalConfig(),
    formConfig: getFormConfig(),
    navigationConfig: getNavigationConfig(),
    touchConfig: getTouchConfig(),

    // Utility functions
    getTableConfig,
    getModalConfig,
    getFormConfig,
    getNavigationConfig,
    getTouchConfig,

    // Responsive classes
    containerClasses: isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-8',
    gridClasses: isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3',
    gapClasses: isMobile ? 'gap-4' : isTablet ? 'gap-6' : 'gap-8',
    textClasses: isMobile ? 'text-sm' : 'text-base'
  };
};

export default useAdminResponsive;