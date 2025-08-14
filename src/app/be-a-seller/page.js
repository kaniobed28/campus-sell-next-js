"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const BecomeASeller = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const router = useRouter();

  // Check auth state and seller status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const sellerDocRef = doc(db, "sellers", currentUser.uid);
        const sellerDoc = await getDoc(sellerDocRef);
        setIsSeller(sellerDoc.exists());
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to apply to become a seller.");
      router.push("/auth");
      return;
    }

    if (isSeller) {
      alert("You are already a seller!");
      router.push("/sell");
      return;
    }

    setIsSubmitting(true);
    try {
      // For simplicity, this adds the user to the sellers collection directly.
      // In a real app, you might want to send this to an admin for approval.
      const sellerData = {
        uid: user.uid,
        email: user.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        reason: formData.reason,
        status: "pending", // Could be "approved" after admin review
        appliedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "sellers", user.uid), sellerData);
      alert("Seller application submitted successfully! Awaiting approval.");
      setFormData({ fullName: "", phoneNumber: "", reason: "" });
      router.push("/profile"); // Redirect to profile or another page
    } catch (error) {
      console.error("Error submitting seller application:", error.message);
      alert("An error occurred while submitting your application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark flex items-center justify-center py-12">
      <div className="container mx-auto px-6 max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-8">Become a Seller</h1>

        {user ? (
          isSeller ? (
            <div className="text-center">
              <p className="text-lg mb-4">You are already a seller!</p>
              <button
                onClick={() => router.push("/sell")}
                className="px-6 py-2 bg-accent text-background rounded-lg hover:bg-accent-dark transition shadow-md dark:bg-accent-dark dark:text-background-dark"
              >
                Go to Sell Page
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
            >
              <div className="mb-4">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary dark:border-primary-dark dark:bg-background-dark dark:text-foreground-dark"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary dark:border-primary-dark dark:bg-background-dark dark:text-foreground-dark"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium mb-2"
                >
                  Why do you want to sell?
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary dark:border-primary-dark dark:bg-background-dark dark:text-foreground-dark"
                  placeholder="Tell us your reason"
                  rows="4"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-2 bg-accent text-background rounded-lg hover:bg-accent-dark transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed dark:bg-accent-dark dark:text-background-dark"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )
        ) : (
          <div className="text-center">
            <p className="text-lg mb-4">Please sign in to apply to become a seller.</p>
            <button
              onClick={() => router.push("/auth")}
              className="px-6 py-2 bg-accent text-background rounded-lg hover:bg-accent-dark transition shadow-md dark:bg-accent-dark dark:text-background-dark"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BecomeASeller;




