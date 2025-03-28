"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCartStore } from "@/app/stores/useCartStore";
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
  const { addToCart, isLoading, error: cartError } = useCartStore();
  const { authUser, fetchUser, loading: profileLoading } = useProfileStore();

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Use the custom hook to fetch product, seller, and related products
  const { product, seller, sellerLoading, relatedProducts } = useProductAndSeller(id);

  // Fetch user profile
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Early returns after hooks
  if (!id) return <Loading />;
  if (!product) return <NotFound />;


  // Normalize image data for ProductImage: use imageUrls if present, otherwise use image
  const imageProp = product.imageUrls || product.image;

  const handleAddToCart = () => {
    if (!authUser) {
      router.push("/auth");
      return;
    }
    setShowQuantityModal(true);
    setSuccessMessage("");
  };

  const handleGoToBasket = () => {
    if (!authUser) {
      router.push("/auth");
      return;
    }
    router.push("/basket");
  };

  const confirmAddToCart = async () => {
    if (quantity < 1) {
      alert("Please enter a quantity of 1 or more.");
      return;
    }
    try {
      await addToCart(product, quantity);
      setSuccessMessage(`Successfully added ${quantity} of ${product.name} to your cart!`);
      setShowQuantityModal(false);
      setQuantity(1);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const closeModal = () => {
    setShowQuantityModal(false);
    setQuantity(1);
  };

  if (profileLoading || sellerLoading) return <Loading message="Loading data..." />;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <Notification type="error" message={cartError} />
      <Notification type="success" message={successMessage} />
      <Notification
        type="warning"
        message={!authUser && "Please log in to add items to your cart or view your basket."}
      />
      <QuantityModal
        isOpen={showQuantityModal}
        productName={product.title}
        quantity={quantity}
        setQuantity={setQuantity}
        onConfirm={confirmAddToCart}
        onClose={closeModal}
        isLoading={isLoading}
      />
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={Array.isArray(imageProp) ? imageProp : [imageProp]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div onClick={() => setIsLightboxOpen(true)} style={{ cursor: "pointer" }}>
          <ProductImage image={imageProp} name={product.name} />
        </div>
        <div>
          <ProductDetails
            product={product}
            onAddToCart={handleAddToCart}
            isLoading={isLoading}
            isAuthenticated={!!authUser}
          />
          <SellerInfo seller={seller} />
        </div>
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={handleGoToBasket}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Go to Basket
        </button>
      </div>
      <RelatedProducts products={relatedProducts} category={product.category} />
    </div>
  );
};

export default ListingPage;