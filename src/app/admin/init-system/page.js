"use client";
import React, { useState } from 'react';
import { initializeAdminSystem, resetAdminSystem, verifyAdminSystem } from '@/scripts/initializeAdminSystem';

const InitAdminSystemPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInitialize = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const result = await initializeAdminSystem();
      setMessage(`Admin system initialized successfully! Principal admin: ${result.principalAdmin.email}`);
    } catch (err) {
      setError('Failed to initialize admin system: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the admin system? This will reinitialize the principal admin.')) {
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const result = await resetAdminSystem();
      setMessage(`Admin system reset successfully! Principal admin: ${result.principalAdmin.email}`);
    } catch (err) {
      setError('Failed to reset admin system: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const result = await verifyAdminSystem();
      if (result.success) {
        setMessage(`Admin system verified successfully! Principal admin: ${result.principalAdmin.email} (Status: ${result.status})`);
      } else {
        setError(`Admin system verification failed: ${result.error}`);
      }
    } catch (err) {
      setError('Failed to verify admin system: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Admin System Management
        </h1>
        <p className="text-muted-foreground">
          Initialize and manage the admin system for the marketplace
        </p>
      </div>

      <div className="card-base rounded-xl p-6 space-y-6">
        {/* Initialize Admin System */}
        <div className="border-b border-border pb-6">
          <h2 className="text-xl font-semibold mb-3">Initialize Admin System</h2>
          <p className="text-muted-foreground mb-4">
            Set up the admin system and initialize the principal admin (kaniobed28@gmail.com). 
            This will create the admin if it doesn't exist, or update permissions if it does.
          </p>
          <button
            onClick={handleInitialize}
            disabled={loading}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Initializing...' : 'Initialize Admin System'}
          </button>
        </div>

        {/* Verify Admin System */}
        <div className="border-b border-border pb-6">
          <h2 className="text-xl font-semibold mb-3">Verify Admin System</h2>
          <p className="text-muted-foreground mb-4">
            Check if the admin system is properly configured and the principal admin exists.
          </p>
          <button
            onClick={handleVerify}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Admin System'}
          </button>
        </div>

        {/* Reset Admin System */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Reset Admin System</h2>
          <p className="text-muted-foreground mb-4">
            <strong>Warning:</strong> This will reset the admin system and reinitialize the principal admin.
          </p>
          <button
            onClick={handleReset}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Admin System'}
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          After initializing the admin system, you can access the{' '}
          <a href="/admin" className="text-primary hover:underline">
            admin dashboard
          </a>{' '}
          with the principal admin account.
        </p>
      </div>
    </div>
  );
};

export default InitAdminSystemPage;



