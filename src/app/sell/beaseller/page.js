"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

// Reusable Input Component
const InputField = ({ label, name, type, value, onChange, placeholder, required = false, error }) => (
  <div className="flex flex-col">
    <label className="mb-2 text-lg font-medium">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`px-4 py-2 border border-gray-300 rounded-lg ${error ? "border-red-500" : ""}`}
      placeholder={placeholder}
      required={required}
    />
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
);

// Reusable TextArea Component
const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 4, required = false, error }) => (
  <div className="flex flex-col">
    <label className="mb-2 text-lg font-medium">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className={`px-4 py-2 border border-gray-300 rounded-lg ${error ? "border-red-500" : ""}`}
      placeholder={placeholder}
      rows={rows}
      required={required}
    />
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
);

const BecomeSellerPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    storeName: "",
    storeDescription: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const router = useRouter();

  // Handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear the error for the specific field
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    let formErrors = {};

    // Validation for required fields
    if (!formData.name) formErrors.name = "Full name is required.";
    if (!formData.email) formErrors.email = "Email is required.";
    if (!formData.storeName) formErrors.storeName = "Store name is required.";
    if (!formData.storeDescription) formErrors.storeDescription = "Store description is required.";
    if (!formData.acceptTerms) formErrors.acceptTerms = "You must accept the terms and conditions.";

    // If there are any validation errors, stop form submission
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Save to Firestore if the form is valid
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "sellers"), {
          name: formData.name,
          email: formData.email,
          storeName: formData.storeName,
          storeDescription: formData.storeDescription,
          userId: user.uid,
        });
        console.log("Form submitted:", formData);
        router.push("/sell");
      }
    } catch (error) {
      console.error("Error saving to Firestore: ", error);
    }
  };

  // Pre-fill the email field if the user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData((prevData) => ({
          ...prevData,
          email: user.email, // Set email to the authenticated user's email
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Become a Seller</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          label="Full Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          required
          error={errors.name}
        />
        <InputField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
          required
          error={errors.email}
        />
        <InputField
          label="Store Name"
          name="storeName"
          type="text"
          value={formData.storeName}
          onChange={handleInputChange}
          placeholder="Enter your store name"
          required
          error={errors.storeName}
        />
        <TextAreaField
          label="Store Description"
          name="storeDescription"
          value={formData.storeDescription}
          onChange={handleInputChange}
          placeholder="Enter a description for your store"
          rows={4}
          required
          error={errors.storeDescription}
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) =>
              setFormData((prevData) => ({
                ...prevData,
                acceptTerms: e.target.checked,
              }))
            }
            className="mr-2"
          />
          <label className="text-lg font-medium">I accept the terms and conditions</label>
        </div>
        {errors.acceptTerms && <span className="text-red-500 text-sm">{errors.acceptTerms}</span>}
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default BecomeSellerPage;
