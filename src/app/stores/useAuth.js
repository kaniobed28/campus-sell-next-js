// hooks/useAuth.js
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const useAuth = () => {
  const [user, setUser] = useState(null); // Store user object
  const [loading, setLoading] = useState(true); // Loading state to handle auth check

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set the user object if authenticated
      setLoading(false); // Set loading to false once auth check is done
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  return { user, loading };
};

