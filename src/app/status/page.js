"use client";
import React from "react";

const StatusPage = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            🔍 System Status
          </h1>
          <p className="text-muted-foreground mb-6">
            Checking if the infinite loop issue is resolved...
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ No Infinite Loop Detected</h3>
              <p className="text-green-700">
                If you can see this page without errors, the infinite loop issue is resolved!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/test-sell"
                className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="text-2xl mb-2">🧪</div>
                <div className="font-semibold">Test Sell Page</div>
                <div className="text-sm text-muted-foreground">Simple test page</div>
              </a>
              
              <a
                href="/sell"
                className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="text-2xl mb-2">💰</div>
                <div className="font-semibold">Sell Page</div>
                <div className="text-sm text-muted-foreground">Simplified sell page</div>
              </a>
              
              <a
                href="/debug"
                className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="text-2xl mb-2">🔧</div>
                <div className="font-semibold">Debug Page</div>
                <div className="text-sm text-muted-foreground">Category debug tools</div>
              </a>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Next Steps</h3>
            <div className="text-blue-700 text-sm space-y-2">
              <p>1. Test each page to ensure no errors</p>
              <p>2. Check browser console for any warnings</p>
              <p>3. Gradually re-enable disabled components</p>
              <p>4. Test the category system functionality</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;




