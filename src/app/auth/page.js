"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import the router
import { signUp, signIn, googleSignIn } from "@/lib/auth";
import AuthForm from "./components/AuthForm";
import GoogleSignInButton from "./components/GoogleSignInButton";
import AuthToggle from "./components/AuthToggle";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter(); // Initialize the router

  const handleAuth = async (email, password) => {
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
      router.back(); // Navigate back to the previous page
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await googleSignIn();
      console.log("Google signed in:", user);
      alert("Signed in with Google!");
      router.back(); // Navigate back to the previous page
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">
        {isSignUp ? "Create an Account" : "Welcome Back"}
      </h2>
      <AuthForm
        isSignUp={isSignUp}
        onSubmit={handleAuth}
        error={error}
      />
      <GoogleSignInButton onClick={handleGoogleSignIn} />
      <AuthToggle
        isSignUp={isSignUp}
        onToggle={() => setIsSignUp(!isSignUp)}
      />
    </div>
  );
};

export default AuthPage;
