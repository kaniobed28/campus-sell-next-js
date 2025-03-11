"use client";
import React from "react";
import { useRouter } from "next/navigation";
import useSellStore from "../stores/useSellStore";
import InputField from "./components/InputField";
import TextAreaField from "./components/TextAreaField";
import SelectField from "./components/SelectField";
import FileUpload from "./components/FileUpload";
import ProgressBar from "./components/ProgressBar";

const SellPage = () => {
  const {
    formData,
    subcategories,
    uploadProgress,
    isSubmitting,
    categories,
    setFormData,
    setSubcategories,
    setImage,
    setIsSubmitting,
    resetForm,
    uploadImage,
    addProductToFirestore,
  } = useSellStore();

  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(name, value);

    if (name === "category") {
      setSubcategories(value);
    }
  };

  const handleImageChange = (files) => {
    // Replace the existing image array with the new selection
    setImage(files);
    console.log("Selected files:", files); // Debug: Check the array of files
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Files to upload:", formData.image); // Debug: Verify files before upload
      const imageUrls = await uploadImage(formData.image);
      console.log("Uploaded URLs:", imageUrls); // Debug: Verify all URLs

      const productData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        subcategory: formData.subcategory,
        imageUrls,
      };

      await addProductToFirestore(productData);

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
        <FileUpload
          label="Upload Images"
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