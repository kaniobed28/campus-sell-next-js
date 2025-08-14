"use client";
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const QuickInitPage = () => {
  const [user, loading, error] = useAuthState(auth);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickInitAdmin = async () => {
    if (!user || user.email !== 'kaniobed28@gmail.com') {
      setMessage('Error: You must be signed in as kaniobed28@gmail.com to initialize admin');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Initializing admin...');

      const adminDoc = doc(db, 'admins', user.email);
      
      // Check if already exists
      const existingDoc = await getDoc(adminDoc);
      if (existingDoc.exists()) {
        setMessage('Admin already exists! You should now have access to the admin dashboard.');
        return;
      }

      // Create admin document
      const adminData = {
        email: user.email,
        role: 'principal',
        permissions: [
          'user_management',
          'product_moderation', 
          'category_management',
          'analytics_view',
          'platform_settings',
          'admin_management',
          'audit_logs'
        ],
        createdAt: serverTimestamp(),
        createdBy: 'system',
        isActive: true,
        lastLogin: null
      };

      await setDoc(adminDoc, adminData);
      setMessage('Success! Admin initialized. You can now access the admin dashboard.');
      
    } catch (err) {
      console.error('Quick init error:', err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    if (!user) {
      setMessage('Please sign in first');
      return;
    }

    try {
      setIsLoading(true);
      const adminDoc = doc(db, 'admins', user.email);
      const adminSnap = await getDoc(adminDoc);
      
      if (adminSnap.exists()) {
        const data = adminSnap.data();
        setMessage(`Admin found! Role: ${data.role}, Active: ${data.isActive}`);
      } else {
        setMessage('No admin record found for this email');
      }
    } catch (err) {
      setMessage(`Error checking status: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Quick Admin Initialization</h1>
        <p className="text-gray-600">Direct admin setup for kaniobed28@gmail.com</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* User Status */}
        <div className="border-b pb-4">
          <h3 className="font-semibold mb-2">Current User</h3>
          {user ? (
            <div>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>UID:</strong> {user.uid}</p>
              <p className={user.email === 'kaniobed28@gmail.com' ? 'text-green-600' : 'text-red-600'}>
                {user.email === 'kaniobed28@gmail.com' ? '✓ Correct email for admin' : '✗ Wrong email for admin'}
              </p>
            </div>
          ) : (
            <p className="text-red-600">Not signed in</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={checkAdminStatus}
            disabled={isLoading || !user}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Check Admin Status'}
          </button>

          <button
            onClick={quickInitAdmin}
            disabled={isLoading || !user || user.email !== 'kaniobed28@gmail.com'}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Initializing...' : 'Initialize Admin (kaniobed28@gmail.com only)'}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('Success') || message.includes('Admin found') 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : message.includes('Error')
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            {message}
          </div>
        )}

        {/* Navigation */}
        <div className="pt-4 border-t space-y-2">
          <a 
            href="/admin" 
            className="block w-full text-center bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Go to Admin Dashboard
          </a>
          <a 
            href="/admin/debug" 
            className="block w-full text-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Debug Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default QuickInitPage;


