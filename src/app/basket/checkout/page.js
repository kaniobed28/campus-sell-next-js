"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../stores/useAuth";
import Loading from "@/components/Loading";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";

const CheckoutPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveryCompanyId, setDeliveryCompanyId] = useState("");
  const [deliveryCompanies, setDeliveryCompanies] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch delivery companies on mount
  useEffect(() => {
    const fetchDeliveryCompanies = async () => {
      try {
        const companiesQuery = query(
          collection(db, "deliveryCompanies"),
          where("status", "==", "active") // Only fetch active companies
        );
        const companiesSnapshot = await getDocs(companiesQuery);
        const companiesData = companiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDeliveryCompanies(companiesData);
        // Set default delivery company if available
        if (companiesData.length > 0) {
          setDeliveryCompanyId(companiesData[0].id);
        }
      } catch (err) {
        console.error("Error fetching delivery companies:", err);
        setError("Failed to load delivery companies. Please try again.");
      }
    };

    if (!authLoading && user) {
      fetchDeliveryCompanies();
    }
  }, [authLoading, user]);

  // Handle loading and authentication states
  if (authLoading) return <Loading />;
  if (!user) {
    router.push("/auth");
    return null;
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate inputs
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!validatePhone(phone)) {
      setError("Invalid phone number. It should contain only digits and be between 10 to 15 characters long.");
      return;
    }
    if (!deliveryCompanyId) {
      setError("Please select a delivery company.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Fetch cart items
      const cartQuery = query(collection(db, "cart"), where("userId", "==", user.uid));
      const cartSnapshot = await getDocs(cartQuery);
      const cartItems = cartSnapshot.docs.map((doc) => ({
        productId: doc.data().productId,
        quantity: doc.data().quantity || 1,
      }));

      if (cartItems.length === 0) {
        setError("Your cart is empty. Please add items before checking out.");
        setIsSubmitting(false);
        return;
      }

      // Create order document
      const orderData = {
        userId: user.uid,
        deliveryDetails: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim(),
        },
        items: cartItems,
        deliveryCompanyId, // Use selected company
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "orders"), orderData);

      // Clear cart
      const deletePromises = cartSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setSuccess(true);
      const selectedCompany = deliveryCompanies.find((c) => c.id === deliveryCompanyId)?.name || "your selected company";
      alert(`Order placed successfully! It will be delivered by ${selectedCompany}. You will be redirected to your orders.`);
      setName("");
      setPhone("");
      setAddress("");
      setNotes("");
      setDeliveryCompanyId(deliveryCompanies[0]?.id || ""); // Reset to first company
      router.push("/orders");
    } catch (err) {
      console.error("Error during checkout:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>
      <p className="text-center">
        Thank you for your purchase, {user.email.split("@")[0]}! Please provide your delivery details below:
      </p>

      {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      {success && <p className="text-green-500 text-center mt-2">Order placed successfully!</p>}

      <form className="mt-4 max-w-lg mx-auto" onSubmit={handleCheckout}>
        <div>
          <label htmlFor="name" className="block font-medium">
            Name <span className="text-red-500">*</span>
          </label>
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
          <label htmlFor="phone" className="block font-medium">
            Phone Number <span className="text-red-500">*</span>
          </label>
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
          <label htmlFor="address" className="block font-medium">
            Address <span className="text-red-500">*</span>
          </label>
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
          <label htmlFor="deliveryCompany" className="block font-medium">
            Delivery Company <span className="text-red-500">*</span>
          </label>
          <select
            id="deliveryCompany"
            value={deliveryCompanyId}
            onChange={(e) => setDeliveryCompanyId(e.target.value)}
            className="border rounded w-full p-2"
            disabled={deliveryCompanies.length === 0}
          >
            {deliveryCompanies.length === 0 ? (
              <option value="">No delivery companies available</option>
            ) : (
              deliveryCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))
            )}
          </select>
          {deliveryCompanies.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">Please add a delivery company first.</p>
          )}
        </div>

        <div className="mt-4">
          <label htmlFor="notes" className="block font-medium">Additional Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded w-full p-2"
            rows="3"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || deliveryCompanies.length === 0}
          className={`bg-blue-600 text-white px-6 py-3 rounded font-bold text-lg mt-4 w-full ${
            isSubmitting || deliveryCompanies.length === 0
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Processing..." : "Confirm Checkout"}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;