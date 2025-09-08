"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import Loading from "@/components/Loading";

const CategoryPage = () => {
  const pathname = usePathname();
  const categorySlug = pathname.split("/").pop(); // Extract the category slug from the URL
  
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (!categorySlug) return;

      setLoading(true);
      setError(null);

      try {
        // First, try to find the category by slug
        const categoriesRef = collection(db, "categories");
        const categoryQuery = query(categoriesRef, where("slug", "==", categorySlug));
        const categorySnapshot = await getDocs(categoryQuery);
        
        let foundCategory = null;
        if (!categorySnapshot.empty) {
          const categoryDoc = categorySnapshot.docs[0];
          foundCategory = { id: categoryDoc.id, ...categoryDoc.data() };
          setCategory(foundCategory);
        }

        // Fetch products that match this category
        const productsRef = collection(db, "products");
        let productsQuery;
        
        // Get all active products and filter in memory to avoid complex Firestore queries
        productsQuery = query(
          productsRef,
          where("status", "==", "active"),
          orderBy("createdAt", "desc")
        );

        const productsSnapshot = await getDocs(productsQuery);
        const fetchedProducts = [];

        productsSnapshot.forEach((doc) => {
          const productData = doc.data();
          
          // Check if this product matches our category
          const matchesCategory = foundCategory 
            ? (productData.categoryId === foundCategory.id || 
               productData.categorySlug === categorySlug ||
               productData.categoryNames?.includes(foundCategory.name))
            : (productData.categorySlug === categorySlug ||
               productData.category?.toLowerCase().replace(/\s+/g, '-') === categorySlug);

          if (matchesCategory) {
            fetchedProducts.push({
              id: doc.id,
              ...productData,
              title: productData.title || productData.name || 'Untitled Product',
              name: productData.title || productData.name || 'Untitled Product',
              description: productData.description || 'No description available',
              price: productData.price || 0,
              image: productData.imageUrls?.[0] || productData.image || '/default-image.jpg',
              likes: productData.likes || 0,
              views: productData.views || 0,
              category: productData.categoryNames?.[0] || productData.category || 'Uncategorized',
              subcategory: productData.subcategoryId || productData.subcategory
            });
          }
        });

        setProducts(fetchedProducts);

        // If no category found but we have products, create a display category
        if (!foundCategory && fetchedProducts.length > 0) {
          setCategory({
            name: categorySlug.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            slug: categorySlug,
            description: `Products in ${categorySlug} category`
          });
        }

      } catch (error) {
        console.error("Error fetching category and products:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [categorySlug]);

  if (loading) {
    return <Loading message="Loading category..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Category</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link href="/categories" className="text-blue-600 hover:underline">
          Back to Categories
        </Link>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">📦</div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {category ? category.name : 'Category'} - No Products Yet
        </h1>
        <p className="text-muted-foreground mb-6">
          No products have been listed in this category yet. Be the first to list something!
        </p>
        <div className="space-x-4">
          <Link 
            href="/sell" 
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            List a Product
          </Link>
          <Link 
            href="/categories" 
            className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/90"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-foreground">Categories</Link>
            <span>/</span>
            <span className="text-foreground">{category?.name || categorySlug}</span>
          </nav>
          
          <div className="flex items-center gap-4 mb-4">
            {category?.icon && (
              <span className="text-4xl">{category.icon}</span>
            )}
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                {category?.name || categorySlug.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </h1>
              {category?.description && (
                <p className="text-muted-foreground mt-2">{category.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {products.length} {products.length === 1 ? 'product' : 'products'} available
            </p>
            <Link 
              href="/sell" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              List in this Category
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid 
          products={products}
          emptyStateMessage="No products have been listed in this category yet. Be the first to list something!"
          emptyStateIcon="📦"
        />

        {/* Back to Categories */}
        <div className="mt-12 text-center">
          <Link 
            href="/categories" 
            className="inline-flex items-center gap-2 text-primary hover:text-accent"
          >
            ← Browse All Categories
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;

