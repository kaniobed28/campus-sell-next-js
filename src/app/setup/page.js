"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAutoSetup } from '@/contexts/AutoSetupProvider';

const SetupPage = () => {
  const router = useRouter();
  const { isInitialized, isInitializing, progress } = useAutoSetup();

  useEffect(() => {
    // Redirect to home page after a short delay
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Automatic Setup
        </h1>
        <p className="text-muted-foreground">
          Your campus marketplace sets up automatically - no manual configuration needed!
        </p>
      </div>

      <div className="card-base rounded-xl p-8 text-center space-y-6">
        <div className="text-6xl mb-4">
          {isInitialized ? '✅' : isInitializing ? '⚙️' : '🚀'}
        </div>
        
        {isInitialized ? (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Setup Complete!
            </h2>
            <p className="text-muted-foreground mb-4">
              Your marketplace is ready to use. You&apos;ll be redirected to the home page.
            </p>
          </div>
        ) : isInitializing ? (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Setting Up Your Marketplace
            </h2>
            <p className="text-muted-foreground mb-4">
              Automatically configuring categories and system components...
            </p>
            {progress > 0 && (
              <div className="max-w-sm mx-auto">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No Setup Required
            </h2>
            <p className="text-muted-foreground mb-4">
              This marketplace features automatic setup. Everything is configured in the background.
            </p>
          </div>
        )}
        
        <div className="flex justify-center">
          <button
            onClick={() => router.push('/')}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;