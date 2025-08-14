"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp, signIn, googleSignIn } from "@/lib/auth";
import AuthForm from "./components/AuthForm";
import GoogleSignInButton from "./components/GoogleSignInButton";
import AuthToggle from "./components/AuthToggle";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (email, password) => {
    setLoading(true);
    setError("");
    
    try {
      if (isSignUp) {
        const user = await signUp(email, password);
        console.log("Signed up:", user);
        alert("Account created successfully!");
      } else {
        const user = await signIn(email, password);
        console.log("Signed in:", user);
        alert("Signed in successfully!");
      }
      router.back();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    
    try {
      const user = await googleSignIn();
      console.log("Google signed in:", user);
      alert("Signed in with Google!");
      router.back();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card-base rounded-lg p-8 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">Campus Sell</h1>
            <h2 className="text-xl font-semibold text-card-foreground">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isSignUp 
                ? "Join the campus marketplace community" 
                : "Sign in to your account to continue"
              }
            </p>
          </div>
          
          <AuthForm
            isSignUp={isSignUp}
            onSubmit={handleAuth}
            error={error}
            loading={loading}
          />
          
          <div className="mt-6">
            <GoogleSignInButton 
              onClick={handleGoogleSignIn} 
              loading={loading}
            />
          </div>
          
          <div className="mt-6">
            <AuthToggle
              isSignUp={isSignUp}
              onToggle={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;




<<<<<<< HEAD

=======
>>>>>>> 9729b63 (bug space added 2 time)
