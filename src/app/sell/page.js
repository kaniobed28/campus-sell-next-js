"use client";
import React from "react";
import { useRouter } from "next/navigation";
import useSellStore from "../stores/useSellStore";
import InputField from "./components/InputField";
import TextAreaField from "./components/TextAreaField";
import SelectField from "./components/SelectField";
import FileUpload from "./components/FileUpload";
import ProgressBar from "./components/ProgressBar";
import { Button } from "../../components/ui/Button";

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
    setImage(files);
    console.log("Selected files:", files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Files to upload:", formData.image);
      const imageUrls = await uploadImage(formData.image);
      console.log("Uploaded URLs:", imageUrls);

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
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Sell Your Product
            </h1>
            <p className="text-muted-foreground text-lg">
              List your item and reach thousands of potential buyers in your campus community
            </p>
          </div>

          {/* Form */}
          <div className="card-base rounded-xl p-6 md:p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              
              <FileUpload
                label="Product Images"
                id="image"
                onChange={handleImageChange}
                required
              />
              
              {uploadProgress > 0 && <ProgressBar progress={uploadProgress} />}
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => {
                    resetForm();
                    router.push("/");
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Listing Product..." : "List Product"}
                </Button>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Check out our{" "}
              <a href="/help" className="text-primary hover:text-accent theme-transition">
                selling guidelines
              </a>{" "}
              for tips on creating great listings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellPage;