"use client";
import React from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import SessionTimeoutWarning from './SessionTimeoutWarning';
import { useRouter } from 'next/navigation';

const AdminLayout = ({ children, title = "Admin Dashboard", breadcrumbs = [] }) => {
  const router = useRouter();
  const { user, adminData, signOut } = useAdminAuth();

  const handleSessionExtend = () => {
    console.log('Session extended');
  };

  const handleSessionTimeout = async () => {
    console.log('Session timed out, signing out...');
    await signOut();
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {breadcrumbs.length > 0 && (
                <nav className="flex" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2 text-sm text-gray-500">
                    <li>
                      <a href="/admin" className="hover:text-gray-700">Admin</a>
                    </li>
                    {breadcrumbs.map((crumb, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="flex-shrink-0 h-4 w-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        {crumb.href ? (
                          <a href={crumb.href} className="hover:text-gray-700">
                            {crumb.label}
                          </a>
                        ) : (
                          <span className="text-gray-900">{crumb.label}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminData?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{adminData?.role} Admin</p>
              </div>
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a
              href="/admin"
              className="border-b-2 border-transparent hover:border-gray-300 py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Dashboard
            </a>
            <a
              href="/admin/init-system"
              className="border-b-2 border-transparent hover:border-gray-300 py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              System Setup
            </a>
            <a
              href="/admin/init-categories"
              className="border-b-2 border-transparent hover:border-gray-300 py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Categories
            </a>
            <a
              href="/admin/users"
              className="border-b-2 border-transparent hover:border-gray-300 py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Users
            </a>
            <a
              href="/admin/products"
              className="border-b-2 border-transparent hover:border-gray-300 py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Products
            </a>
            <a
              href="/admin/audit-logs"
              className="border-b-2 border-transparent hover:border-gray-300 py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Audit Logs
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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