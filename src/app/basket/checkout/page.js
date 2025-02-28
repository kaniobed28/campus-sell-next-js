"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../stores/useAuth";
import Loading from "@/components/Loading";

const CheckoutPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (loading) return <Loading />;
  if (!user) {
    router.push("/auth");
    return null;
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10,15}$/; // Only digits, length between 10-15
    return phoneRegex.test(phone);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!validatePhone(phone)) {
      setError("Invalid phone number. It should contain only digits and be between 10 to 15 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(true);
      alert("Checkout process completed successfully!");
      setName("");
      setPhone("");
      setAddress("");
      setNotes("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
      <p className="text-center">
        Thank you for your purchase, {user.email.split("@")[0]}! Your order will be delivered by Fleet. Please provide your delivery details below:
      </p>

      {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      {success && <p className="text-green-500 text-center mt-2">Order placed successfully!</p>}

      <form className="mt-4" onSubmit={handleCheckout}>
        <div>
          <label htmlFor="name" className="block font-medium">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded w-full p-2"
            required
          />
        </div>

        <div className="mt-4">
          <label htmlFor="phone" className="block font-medium">Phone Number:</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border rounded w-full p-2"
            required
          />
        </div>

        <div className="mt-4">
          <label htmlFor="address" className="block font-medium">Address:</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border rounded w-full p-2"
            required
          />
        </div>

        <div className="mt-4">
          <label htmlFor="notes" className="block font-medium">Additional Notes:</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded w-full p-2"
            rows="3"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-blue-600 text-white px-6 py-3 rounded font-bold text-lg mt-4 w-full ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Processing..." : "Confirm Checkout"}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
