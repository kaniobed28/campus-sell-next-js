"use client";
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const CategoryDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const categoriesRef = collection(db, 'categories');
        const snapshot = await getDocs(categoriesRef);
        
        const categories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setDebugInfo({
          totalCategories: categories.length,
          categories: categories.slice(0, 5), // Show first 5 for debugging
          firebaseConnected: true,
        });
      } catch (error) {
        setDebugInfo({
          error: error.message,
          firebaseConnected: false,
        });
      } finally {
        setLoading(false);
      }
    };

    checkDatabase();
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Checking database...</div>;
  }

  return (
    <div className="bg-muted p-4 rounded-lg text-sm border border-border">
      <h3 className="font-semibold mb-2 text-foreground">Debug Info:</h3>
      <pre className="whitespace-pre-wrap text-muted-foreground">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

export default CategoryDebug;