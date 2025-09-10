"use client";

import { useState, useEffect } from 'react';
import searchService from '@/services/searchService';

export default function TestSearchPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Executing search...');
      const searchResults = await searchService.searchProducts(
        { query: '' },
        { field: 'createdAt', direction: 'desc' },
        { page: 1, limit: 20, lastDoc: null }
      );
      console.log('Search results:', searchResults);
      setResults(searchResults.products);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testSearch();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Search</h1>
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p>Loading...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      )}
      
      <div className="mt-4">
        <p>Found {results.length} products</p>
        {results.map((product) => (
          <div key={product.id} className="border p-4 mb-2 rounded">
            <h3 className="font-bold">{product.title || 'Untitled Product'}</h3>
            <p>Price: ${product.price || 0}</p>
            <p>Category: {product.category || 'Uncategorized'}</p>
          </div>
        ))}
      </div>
      
      <button 
        onClick={testSearch}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Test Search'}
      </button>
    </div>
  );
}