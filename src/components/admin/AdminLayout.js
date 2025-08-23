"use client";
import React, { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminResponsive } from '@/hooks/useAdminResponsive';
import SessionTimeoutWarning from './SessionTimeoutWarning';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useRouter } from 'next/navigation';
import { ADMIN_ROLES } from '@/types/admin';

const AdminLayout = ({ children, title = "Admin Dashboard", breadcrumbs = [] }) => {
  const router = useRouter();
  const { user, adminData, signOut } = useAdminAuth();
  const { 
    isMobile, 
    isTablet, 
    mobileMenuOpen, 
    setMobileMenuOpen, 
    touchConfig,
    containerClasses 
  } = useAdminResponsive();
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSessionExtend = () => {
    console.log('Session extended');
  };

  const handleSessionTimeout = async () => {
    console.log('Session timed out, signing out...');
    await signOut();
    router.push('/auth');
  };

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/init-system', label: 'System Setup', icon: '⚙️' },
    { href: '/admin/init-categories', label: 'Categories', icon: '📂' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/products', label: 'Products', icon: '📦' },
    { href: '/admin/delivery-companies', label: 'Delivery Companies', icon: '🚚' },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
    ...(adminData?.role === ADMIN_ROLES.PRINCIPAL ? [
      { href: '/admin/admins', label: 'Admin Management', icon: '👑' }
    ] : [])
  ];

  const MobileNavigation = () => (
    <>
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu */}
      <div
        className={`
          fixed top-0 left-0 h-full w-80 bg-card shadow-xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="mobile-menu-title" className="text-lg font-semibold text-foreground">
            Admin Menu
          </h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ minHeight: touchConfig.minTouchTarget, minWidth: touchConfig.minTouchTarget }}
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted hover:text-accent transition-colors duration-200"
              style={{ minHeight: touchConfig.minTouchTarget }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="text-lg" role="img" aria-hidden="true">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Mobile user info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-muted">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-medium text-sm">
                {adminData?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{adminData?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{adminData?.role} Admin</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:opacity-90 text-sm font-medium transition-colors duration-200"
            style={{ minHeight: touchConfig.minTouchTarget }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );

  const DesktopNavigation = () => (
    <nav className="bg-card border-b border-border">
      <div className={`max-w-7xl mx-auto ${containerClasses}`}>
        <div className="flex space-x-8 overflow-x-auto">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="border-b-2 border-transparent hover:border-muted-foreground py-4 px-1 text-sm font-medium text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {!isMobile && (
                <span className="mr-2" role="img" aria-hidden="true">{item.icon}</span>
              )}
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className={`max-w-7xl mx-auto ${containerClasses}`}>
          <div className="flex justify-between items-center py-4">
            {/* Mobile menu button and title */}
            <div className="flex items-center space-x-4">
              {(isMobile || isTablet) && (
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring lg:hidden"
                  style={{ minHeight: touchConfig.minTouchTarget, minWidth: touchConfig.minTouchTarget }}
                  aria-label="Open menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              
              <div>
                <h1 className={`font-bold text-foreground ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {isMobile && title.length > 20 ? title.substring(0, 20) + '...' : title}
                </h1>
                {breadcrumbs.length > 0 && !isMobile && (
                  <nav className="flex mt-1" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <li>
                        <a 
                          href="/admin" 
                          className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                        >
                          Admin
                        </a>
                      </li>
                      {breadcrumbs.map((crumb, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="flex-shrink-0 h-4 w-4 mx-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          {crumb.href ? (
                            <a 
                              href={crumb.href} 
                              className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                            >
                              {crumb.label}
                            </a>
                          ) : (
                            <span className="text-foreground">{crumb.label}</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}
              </div>
            </div>

            {/* Desktop user menu */}
            {!isMobile && !isTablet && (
              <div className="flex items-center space-x-4">
                <DarkModeToggle />
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{adminData?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{adminData?.role} Admin</p>
                </div>
                <button
                  onClick={signOut}
                  className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:opacity-90 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
                  style={{ minHeight: touchConfig.minTouchTarget }}
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* Mobile user avatar */}
            {(isMobile || isTablet) && (
              <div className="flex items-center space-x-2">
                <DarkModeToggle />
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    {adminData?.email?.charAt(0).toUpperCase()}
                  </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-card rounded-lg shadow-lg border border-border z-10">
                    <div className="p-4 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">{adminData?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{adminData?.role} Admin</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={signOut}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200"
                        style={{ minHeight: touchConfig.minTouchTarget }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      {isMobile || isTablet ? <MobileNavigation /> : <DesktopNavigation />}

      {/* Main Content */}
      <main 
        id="main-content"
        className={`max-w-7xl mx-auto ${containerClasses} py-8`}
        role="main"
      >
        {children}
      </main>

      {/* Session timeout warning */}
      <SessionTimeoutWarning 
        onExtend={handleSessionExtend}
        onSignOut={handleSessionTimeout}
      />
    </div>
  );
};

export default AdminLayout;