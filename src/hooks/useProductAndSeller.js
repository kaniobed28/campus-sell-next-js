import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";

const useProductAndSeller = (id) => {
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProductAndSeller = async () => {
      if (!id) return;

      setProductLoading(true);
      setSellerLoading(true);

      try {
        // Fetch product from Firebase
        const productDocRef = doc(db, "products", id);
        const productDoc = await getDoc(productDocRef);
        
        if (!productDoc.exists()) {
          setProduct(null);
          setProductLoading(false);
          setSellerLoading(false);
          return;
        }

        const productData = productDoc.data();
        const enrichedProduct = {
          id: productDoc.id,
          ...productData,
          // Ensure consistent data structure
          name: productData.title || productData.name || 'Untitled Product',
          title: productData.title || productData.name || 'Untitled Product',
          description: productData.description || '',
          category: productData.categoryNames?.[0] || productData.category || 'Uncategorized',
          categoryNames: productData.categoryNames || [],
          price: productData.price || 0,
          imageUrls: productData.imageUrls || [],
          image: productData.imageUrls?.[0] || productData.image || '/default-image.jpg',
          likes: productData.likes || 0,
          views: productData.views || 0,
          sellerName: productData.sellerName || 'Anonymous',
          sellerEmail: productData.sellerEmail || '',
          createdBy: productData.createdBy || '',
          createdAt: productData.createdAt,
          status: productData.status || 'active'
        };

        setProduct(enrichedProduct);
        setProductLoading(false);

        // Fetch related products from the same category
        if (enrichedProduct.categoryId || enrichedProduct.category) {
          try {
            const relatedQuery = query(
              collection(db, "products"),
              where("categoryId", "==", enrichedProduct.categoryId || ""),
              limit(4)
            );
            
            const relatedSnapshot = await getDocs(relatedQuery);
            const related = [];
            
            relatedSnapshot.forEach((doc) => {
              if (doc.id !== id) { // Exclude current product
                const relatedData = doc.data();
                related.push({
                  id: doc.id,
                  ...relatedData,
                  name: relatedData.title || relatedData.name || 'Untitled Product',
                  title: relatedData.title || relatedData.name || 'Untitled Product',
                  category: relatedData.categoryNames?.[0] || relatedData.category || 'Uncategorized',
                  image: relatedData.imageUrls?.[0] || relatedData.image || '/default-image.jpg'
                });
              }
            });
            
            setRelatedProducts(related);
          } catch (error) {
            console.error("Error fetching related products:", error);
            setRelatedProducts([]);
          }
        }

        // Fetch seller information
        if (enrichedProduct.createdBy) {
          try {
            // First try to get from users collection
            const userDocRef = doc(db, "users", enrichedProduct.createdBy);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setSeller({
                fullName: userData.displayName || userData.name || enrichedProduct.sellerName || 'Anonymous',
                email: userData.email || enrichedProduct.sellerEmail || '',
                profileImage: userData.photoURL || userData.profileImage || '',
                joinedDate: userData.createdAt || enrichedProduct.createdAt,
                ...userData
              });
            } else {
              // Fallback to product seller info
              setSeller({
                fullName: enrichedProduct.sellerName || 'Anonymous',
                email: enrichedProduct.sellerEmail || '',
                profileImage: '',
                joinedDate: enrichedProduct.createdAt
              });
            }
          } catch (error) {
            console.error("Error fetching seller details:", error);
            setSeller({
              fullName: enrichedProduct.sellerName || 'Anonymous',
              email: enrichedProduct.sellerEmail || '',
              profileImage: '',
              joinedDate: enrichedProduct.createdAt
            });
          }
        } else {
          setSeller({
            fullName: enrichedProduct.sellerName || 'Anonymous',
            email: enrichedProduct.sellerEmail || '',
            profileImage: '',
            joinedDate: enrichedProduct.createdAt
          });
        }

      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setSellerLoading(false);
        setProductLoading(false);
      }
    };

    fetchProductAndSeller();
  }, [id]);

  return { product, seller, sellerLoading, productLoading, relatedProducts };
};

export default useProductAndSeller;