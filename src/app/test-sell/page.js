"use client";
import React, { useState } from "react";

const TestSellPage = () => {
  const [message, setMessage] = useState('');

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Test Sell Page
          </h1>
          <p className="text-muted-foreground mb-6">
            This is a simple test page to check if the infinite loop is resolved.
          </p>
          
          <button
            onClick={() => setMessage('Button clicked! No infinite loop detected.')}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Test Button
          </button>
          
          {message && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{message}</p>
            </div>
          )}
          
          <div className="mt-8">
            <a
              href="/sell"
              className="text-primary hover:underline"
            >
              Back to Sell Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSellPage;



<<<<<<< HEAD

=======
>>>>>>> 9729b63 (bug space added 2 time)
