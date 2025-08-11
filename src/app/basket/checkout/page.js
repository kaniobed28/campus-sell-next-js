"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../stores/useAuth";
import { useViewport } from "@/hooks/useViewport";
import { useResponsiveTypography } from "@/hooks/useResponsiveTypography";
import Loading from "@/components/Loading";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";

const CheckoutPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { isMobile, isTablet, isTouchDevice } = useViewport();
  const { getResponsiveTextClass, getResponsiveHeadingClass } = useResponsiveTypography();

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

  // Responsive classes
  const containerClasses = `
    container mx-auto 
    ${isMobile ? 'px-4 py-8' : isTablet ? 'px-6 py-12' : 'px-8 py-16'}
  `;

  const formClasses = `
    mt-6 ${isMobile ? 'w-full' : isTablet ? 'max-w-2xl' : 'max-w-lg'} mx-auto
  `;

  const inputClasses = `
    border border-gray-300 rounded-lg w-full 
    ${isMobile ? 'p-4' : 'p-3'} 
    ${getResponsiveTextClass('body-base')}
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

  const labelClasses = `
    block font-medium mb-2 ${getResponsiveTextClass('body-base')}
  `;

  const submitButtonClasses = `
    bg-blue-600 text-white font-bold rounded-lg mt-6 w-full
    ${isMobile ? 'px-6 py-4' : 'px-6 py-3'} 
    ${getResponsiveTextClass('body-lg')}
    ${isTouchDevice ? 'min-h-[48px] active:scale-95' : 'min-h-[44px]'}
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${isSubmitting || deliveryCompanies.length === 0 ? '' : 'hover:bg-blue-700 hover:shadow-lg'}
  `;

  const fieldSpacing = isMobile ? 'mt-6' : 'mt-4';

  return (
    <div className={containerClasses}>
      <div className={isMobile ? 'text-center' : 'text-center'}>
        <h1 className={`${getResponsiveHeadingClass(1, 'display')} mb-6`}>
          Checkout
        </h1>
        <p className={`${getResponsiveTextClass('body-base')} text-gray-600`}>
          Thank you for your purchase, {user.email.split("@")[0]}! Please provide your delivery details below:
        </p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className={`
          bg-red-50 border border-red-200 rounded-lg p-4 mt-6
          ${isMobile ? 'text-center' : ''}
        `}>
          <p className={`${getResponsiveTextClass('body-base')} text-red-800`}>
            {error}
          </p>
        </div>
      )}
      
      {success && (
        <div className={`
          bg-green-50 border border-green-200 rounded-lg p-4 mt-6
          ${isMobile ? 'text-center' : ''}
        `}>
          <p className={`${getResponsiveTextClass('body-base')} text-green-800`}>
            Order placed successfully!
          </p>
        </div>
      )}

      <form className={formClasses} onSubmit={handleCheckout}>
        {/* Name Field */}
        <div>
          <label htmlFor="name" className={labelClasses}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClasses}
            placeholder="Enter your full name"
            required
            autoComplete="name"
          />
        </div>

        {/* Phone Field */}
        <div className={fieldSpacing}>
          <label htmlFor="phone" className={labelClasses}>
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClasses}
            placeholder="Enter your phone number"
            required
            autoComplete="tel"
          />
        </div>

        {/* Address Field */}
        <div className={fieldSpacing}>
          <label htmlFor="address" className={labelClasses}>
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClasses}
            placeholder="Enter your delivery address"
            required
            autoComplete="address-line1"
          />
        </div>

        {/* Delivery Company Field */}
        <div className={fieldSpacing}>
          <label htmlFor="deliveryCompany" className={labelClasses}>
            Delivery Company <span className="text-red-500">*</span>
          </label>
          <select
            id="deliveryCompany"
            value={deliveryCompanyId}
            onChange={(e) => setDeliveryCompanyId(e.target.value)}
            className={inputClasses}
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
            <p className={`${getResponsiveTextClass('body-sm')} text-gray-500 mt-2`}>
              Please add a delivery company first.
            </p>
          )}
        </div>

        {/* Notes Field */}
        <div className={fieldSpacing}>
          <label htmlFor="notes" className={labelClasses}>
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClasses} resize-none`}
            rows={isMobile ? "4" : "3"}
            placeholder="Any special delivery instructions..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || deliveryCompanies.length === 0}
          className={submitButtonClasses}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
              Processing...
            </div>
          ) : (
            "Confirm Checkout"
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;