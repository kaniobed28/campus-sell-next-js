"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSellStore from "../stores/useSellStore";
import InputField from "./components/InputField";
import TextAreaField from "./components/TextAreaField";
import SelectField from "./components/SelectField";
import FileUpload from "./components/FileUpload";
import ProgressBar from "./components/ProgressBar";
import Select from "react-select";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Loading from "@/components/Loading";
import { db } from "@/lib/firebase";
import { query, collection, where, getDocs } from "firebase/firestore"; 


const SellPage = () => {
  const {
    formData,
    subcategories,
    uploadProgress,
    isSubmitting,
    categories,
    universities,
    setFormData,
    setSubcategories,
    setImage,
    setIsSubmitting,
    resetForm,
    uploadImage,
    addProductToFirestore,
  } = useSellStore();

  const [isSeller, setIsSeller] = useState(false);
  const router = useRouter();


useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Check if the user is a seller by querying the 'sellers' collection
      const sellersRef = collection(db, "sellers"); // Access the sellers collection
      const q = query(sellersRef, where("userId", "==", user.uid)); // Query for the userId
      const querySnapshot = await getDocs(q); // Get the documents

      if (!querySnapshot.empty) {
        // If documents exist, user is a seller
        setIsSeller(true);
      } else {
        router.push("/sell/beaseller"); // Redirect to Become Seller page if not a seller
      }
    } else {
      router.push("/login"); // Redirect to login page if not authenticated
    }
  });

  return () => unsubscribe();
}, [router]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(name, value);

    if (name === "category") {
      setSubcategories(value);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleUniversityChange = (selectedOptions) => {
    const selectedUniversities = selectedOptions.map(option => option.value);
    setFormData("universities", selectedUniversities); // Update universities in formData
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const imageUrl = await uploadImage(formData.image);

      await addProductToFirestore({
        ...formData,
        imageUrl,
      });

      alert("Product listed successfully!");
      resetForm();
      router.push("/listings");
    } catch (error) {
      console.error("Error listing product:", error);
      alert("Failed to list the product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map universities to react-select options format
  const universityOptions = universities.map((university) => ({
    value: university,
    label: university,
  }));

  if (!isSeller) {
    return <Loading></Loading>; // Show a loading message while checking if the user is a seller
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Sell Your Product</h1>
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md"
      >
        <InputField
          label="Product Title"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
        <TextAreaField
          label="Description"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
        <InputField
          label="Price (USD)"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          type="number"
          required
        />
        <SelectField
          label="Category"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          options={Object.keys(categories)}
          required
        />
        {subcategories.length > 0 && (
          <SelectField
            label="Subcategory"
            id="subcategory"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleInputChange}
            options={subcategories}
            required
          />
        )}
        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">
            Select Universities Where Product is Available
          </label>
          <Select
            isMulti
            name="universities"
            options={universityOptions}
            value={universityOptions.filter(option => formData.universities.includes(option.value))}
            onChange={handleUniversityChange}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        <FileUpload
          label="Upload Image"
          id="image"
          onChange={handleImageChange}
          required
        />
        {uploadProgress > 0 && <ProgressBar progress={uploadProgress} />}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
        >
          {isSubmitting ? "Submitting..." : "List Product"}
        </button>
      </form>
    </div>
  );
};

export default SellPage;
