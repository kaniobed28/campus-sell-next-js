import { useEffect, useState } from "react";
import products from "@/dummyData/products";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const useProductAndSeller = (id) => {
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]); // Add state for related products

  useEffect(() => {
    const fetchProductAndSeller = async () => {
      if (!id) return;

      const foundProduct = products.find((item) => item.id.toString() === id);
      if (!foundProduct) {
        setProduct(null); // Will trigger NotFound later
        setSellerLoading(false);
        return;
      }

      setProduct(foundProduct);

      // Compute related products
      const related = products.filter(
        (item) => item.category === foundProduct.category && item.id.toString() !== id
      );
      setRelatedProducts(related);

      if (!foundProduct.userId) {
        setSellerLoading(false);
        return;
      }

      try {
        const sellerDocRef = doc(db, "sellers", foundProduct.userId);
        const sellerDoc = await getDoc(sellerDocRef);
        if (sellerDoc.exists()) {
          setSeller(sellerDoc.data());
        } else {
          setSeller({ fullName: "Unknown Seller" });
        }
      } catch (error) {
        console.error("Error fetching seller details:", error.message);
        setSeller({ fullName: "Error fetching seller" });
      } finally {
        setSellerLoading(false);
      }
    };

    fetchProductAndSeller();
  }, [id]);

  return { product, seller, sellerLoading, relatedProducts }; // Return relatedProducts
};

export default useProductAndSeller;