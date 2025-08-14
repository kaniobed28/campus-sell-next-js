"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/stores/useAuth";
import Loading from "@/components/Loading";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const CreateDeliveryCompanyPage = () => {
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [deliveryAreas, setDeliveryAreas] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Handle loading and authentication states
  if (authLoading) return <Loading />;
  if (!user) {
    router.push("/auth");
    return null;
  }

  // Basic email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Input validation
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (contactInfo && !validateEmail(contactInfo)) {
      setError("Please enter a valid email address for contact info.");
      return;
    }
    if (!["active", "inactive"].includes(status)) {
      setError("Status must be 'active' or 'inactive'.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare delivery company data
      const companyData = {
        name: name.trim(),
        contactInfo: contactInfo.trim() || null,
        deliveryAreas: deliveryAreas
          .split(",")
          .map((area) => area.trim())
          .filter(Boolean) || ["all"], // Convert to array, default to ["all"] if empty
        status,
        createdAt: new Date().toISOString(),
        createdBy: user.uid, // Track who created it
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "deliveryCompanies"), companyData);

      setSuccess(true);
      setError("");
      alert(`Delivery company "${name}" created successfully with ID: ${docRef.id}`);
      // Reset form
      setName("");
      setContactInfo("");
      setDeliveryAreas("");
      setStatus("active");
      router.push("/deliveryCompanies"); // Redirect to delivery companies list
    } catch (err) {
      console.error("Error creating delivery company:", err);
      setError("Failed to create delivery company. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Create Delivery Company</h1>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {success && (
        <p className="text-green-500 text-center mb-4">Delivery company created successfully!</p>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
        <div>
          <label htmlFor="name" className="block font-medium mb-1">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded w-full p-2"
            placeholder="e.g., Fleet"
            required
          />
        </div>

        <div>
          <label htmlFor="contactInfo" className="block font-medium mb-1">
            Contact Email (optional)
          </label>
          <input
            type="email"
            id="contactInfo"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="border rounded w-full p-2"
            placeholder="e.g., contact@fleet.com"
          />
        </div>

        <div>
          <label htmlFor="deliveryAreas" className="block font-medium mb-1">
            Delivery Areas (comma-separated, optional)
          </label>
          <input
            type="text"
            id="deliveryAreas"
            value={deliveryAreas}
            onChange={(e) => setDeliveryAreas(e.target.value)}
            className="border rounded w-full p-2"
            placeholder="e.g., New York, Los Angeles"
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave blank for all areas. Separate areas with commas.
          </p>
        </div>

        <div>
          <label htmlFor="status" className="block font-medium mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded w-full p-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-blue-600 text-white px-6 py-3 rounded font-bold text-lg ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Creating..." : "Create Delivery Company"}
        </button>
      </form>
    </div>
  );
};

export default CreateDeliveryCompanyPage;

