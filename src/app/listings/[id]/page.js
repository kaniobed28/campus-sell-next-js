// src/pages/listings/[id].js
"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCartStore } from "@/app/stores/useCartStore";
import useProfileStore from "@/app/stores/useProfileStore";
import products from "@/dummyData/products";
import Loading from "@/components/Loading";
import NotFound from "@/components/NotFound";
import ProductImage from "@/components/ProductImage";
import ProductDetails from "@/components/ProductDetails";
import QuantityModal from "@/components/QuantityModal";
import RelatedProducts from "@/components/RelatedProducts";
import Notification from "@/components/Notification";

const ListingPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, isLoading, error: cartError } = useCartStore();
  const { authUser, fetchUser, loading: profileLoading } = useProfileStore();

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!id) return <Loading />;
  const product = products.find((item) => item.id.toString() === id);
  if (!product) return <NotFound />;

  const relatedProducts = products.filter(
    (item) => item.category === product.category && item.id.toString() !== id
  );

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

  if (profileLoading) return <Loading message="Loading user data..." />;

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <ProductImage image={product.image} name={product.name} />
        <ProductDetails
          product={product}
          onAddToCart={handleAddToCart}
          isLoading={isLoading}
          isAuthenticated={!!authUser}
        />
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