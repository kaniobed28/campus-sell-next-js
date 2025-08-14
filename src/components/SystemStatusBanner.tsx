"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const SystemStatusBanner: React.FC = () => {
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Check if user has already dismissed the banner
        const dismissed = localStorage.getItem('system-setup-dismissed');
        if (dismissed) {
          setDismissed(true);
          setLoading(false);
          return;
        }

        // Check if categories exist
        const categoriesRef = collection(db, 'categories');
        const snapshot = await getDocs(categoriesRef);
        
        setNeedsSetup(snapshot.empty);
      } catch (error) {
        console.error('Error checking system status:', error);
        setNeedsSetup(true); // Assume setup is needed if we can't check
      } finally {
        setLoading(false);
      }
    };

    checkSystemStatus();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('system-setup-dismissed', 'true');
  };

  if (loading || dismissed || !needsSetup) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-yellow-600">⚠️</div>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              System Setup Required
            </p>
            <p className="text-xs text-yellow-700">
              Your marketplace needs to be set up with product categories.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/setup"
            className="text-xs bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors"
          >
            Set Up Now
          </Link>
          <button
            onClick={handleDismiss}
            className="text-yellow-600 hover:text-yellow-800 text-xs"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusBanner;