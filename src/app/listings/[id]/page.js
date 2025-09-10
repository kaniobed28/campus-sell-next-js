"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import useProfileStore from "@/app/stores/useProfileStore";
import useProductAndSeller from "@/hooks/useProductAndSeller"; // Import the new hook
import Loading from "@/components/Loading";
import NotFound from "@/components/NotFound";
import ProductImage from "@/components/ProductImage";
import ProductDetails from "@/components/ProductDetails";
import QuantityModal from "@/components/QuantityModal";
import RelatedProducts from "@/components/RelatedProducts";
import Notification from "@/components/Notification";
import ImageLightbox from "@/components/ImageLightbox";
import SellerInfo from "@/components/SellerInfo"; // Import the new component


const ListingPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { authUser, fetchUser, loading: profileLoading } = useProfileStore();

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Use the custom hook to fetch product, seller, and related products
  const { product, seller, sellerLoading, productLoading, relatedProducts } = useProductAndSeller(id);

  // Fetch user profile
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Early returns after hooks
  if (!id) return <Loading />;
  if (productLoading) return <Loading message="Loading product details..." />;
  if (!product) return <NotFound />;


  // Normalize image data for ProductImage: use imageUrls if present, otherwise use image
  const imageProp = product.imageUrls || product.image;

  const handleContactSeller = () => {
    if (!authUser) {
      router.push("/auth");
      return;
    }
    // TODO: Implement contact seller functionality
    alert("Contact seller functionality would be implemented here");
  };

  const confirmContactSeller = async () => {
    if (quantity < 1) {
      alert("Please enter a quantity of 1 or more.");
      return;
    }
    try {
      setIsLoading(true);
      // TODO: Implement contact seller functionality
      setSuccessMessage(`Successfully contacted seller about ${quantity} of ${product.title || product.name}!`);
      setShowQuantityModal(false);
      setQuantity(1);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to contact seller:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowQuantityModal(false);
    setQuantity(1);
  };

  if (profileLoading || sellerLoading) return <Loading message="Loading data..." />;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl" data-testid="listing-container">
      <Notification type="success" message={successMessage} />
      <Notification
        type="warning"
        message={!authUser && "Please log in to contact sellers about items."}
      />
      <QuantityModal
        isOpen={showQuantityModal}
        productName={product.title || product.name || 'Product'}
        quantity={quantity}
        setQuantity={setQuantity}
        onConfirm={confirmContactSeller}
        onClose={closeModal}
        isLoading={isLoading}
      />
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={Array.isArray(imageProp) ? imageProp : [imageProp]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 card-base p-8 rounded-2xl shadow-xl border">
        <div onClick={() => setIsLightboxOpen(true)} style={{ cursor: "pointer" }}>
          <ProductImage image={imageProp} name={product.name} />
        </div>
        <div>
          <ProductDetails
            product={product}
            onAddToCart={handleContactSeller}
            isLoading={isLoading}
            isAuthenticated={!!authUser}
          />
          <SellerInfo seller={seller} />
        </div>
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={handleContactSeller}
          className="btn-primary px-6 py-3 rounded font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Contact Seller
        </button>
      </div>
      <RelatedProducts products={relatedProducts} category={product.category} />
    </div>
  );
};

export default ListingPage;