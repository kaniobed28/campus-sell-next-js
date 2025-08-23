import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const useSimpleCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (loading) return; // Prevent multiple simultaneous calls
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching categories...');
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      
      const fetchedCategories = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        fetchedCategories.push({
          id: doc.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          icon: data.icon,
          parentId: data.parentId || null,
          displayOrder: data.displayOrder || 0,
          isActive: data.isActive !== false, // Default to true
          metadata: data.metadata || {
            productCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'unknown'
          }
        });
      });
      
      // Sort by display order
      fetchedCategories.sort((a, b) => a.displayOrder - b.displayOrder);
      
      console.log('✅ Categories fetched:', fetchedCategories.length);
      setCategories(fetchedCategories);
      
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loading]); // Only depend on loading to prevent infinite loops

  // Auto-fetch on mount
  useEffect(() => {
    fetchCategories();
  }, []); // Empty dependency array

  const getParentCategories = useCallback(() => {
    return categories.filter(cat => !cat.parentId);
  }, [categories]);

  const getSubcategories = useCallback((parentId) => {
    return categories.filter(cat => cat.parentId === parentId);
  }, [categories]);

  const getCategoryById = useCallback((id) => {
    return categories.find(cat => cat.id === id) || null;
  }, [categories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getParentCategories,
    getSubcategories,
    getCategoryById,
    // Computed values
    parentCategories: getParentCategories(),
    hasCategories: categories.length > 0
  };
};