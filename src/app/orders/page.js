"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../stores/useAuth";
import Loading from "@/components/Loading";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore";

const OrdersPage = () => {
  // State management for orders, loading, and errors
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth(); // Authentication state from custom hook
  const router = useRouter();

  // Fetch orders when user is authenticated
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Query orders for the current user, sorted by creation date (descending)
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Handle case where no orders exist
        if (ordersData.length === 0) {
          setOrders([]);
          setIsLoading(false);
          return;
        }

        // Collect unique product IDs from all orders
        const productIdsSet = new Set();
        ordersData.forEach((order) => {
          order.items.forEach((item) => {
            productIdsSet.add(item.productId);
          });
        });
        const productIds = Array.from(productIdsSet);

        // Fetch product details for all unique product IDs
        const productPromises = productIds.map(async (productId) => {
          const productDocRef = doc(db, "products", productId);
          const productDocSnap = await getDoc(productDocRef);
          return productDocSnap.exists() ? { id: productId, ...productDocSnap.data() } : null;
        });
        const productDocs = await Promise.all(productPromises);
        const productsMap = productDocs
          .filter((doc) => doc)
          .reduce((map, doc) => {
            map[doc.id] = doc;
            return map;
          }, {});

        // Enrich orders with product details and calculate totals
        const enrichedOrders = ordersData.map((order) => {
          let total = 0;
          const enrichedItems = order.items.map((item) => {
            const product = productsMap[item.productId];
            if (!product) {
              console.warn(`Product not found for productId: ${item.productId}`);
              return {
                productId: item.productId,
                quantity: item.quantity || 1,
                title: "Product not found",
                price: 0,
                itemTotal: 0,
              };
            }
            const price = typeof product.price === "string" ? parseFloat(product.price) || 0 : product.price || 0;
            const itemTotal = price * (item.quantity || 1);
            total += itemTotal;
            return {
              productId: item.productId,
              quantity: item.quantity || 1,
              title: product.title || "Unknown Product",
              price,
              itemTotal,
            };
          });

          return {
            ...order,
            items: enrichedItems,
            total,
          };
        });

        setOrders(enrichedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchOrders();
    }
  }, [user, authLoading]);

  // Handle loading and authentication states
  if (authLoading || isLoading) return <Loading />;
  if (!user) {
    router.push("/auth");
    return null;
  }

  // Render the orders page
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Orders</h1>
      {error && <p className="text-center text-red-600 mb-4">{error}</p>}
      {orders.length > 0 ? (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Order ID: {order.id}</h2>
                <span
                  className={`px-2 py-1 rounded ${
                    order.status === "pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : order.status === "shipped"
                      ? "bg-blue-200 text-blue-800"
                      : order.status === "delivered"
                      ? "bg-green-200 text-green-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p>
                <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Delivery Company:</strong> Fleet {/* Hardcoded for now; fetch dynamically in the future */}
              </p>
              <p>
                <strong>Delivery Details:</strong>
              </p>
              <ul className="list-disc pl-5">
                <li>Name: {order.deliveryDetails.name}</li>
                <li>Phone: {order.deliveryDetails.phone}</li>
                <li>Address: {order.deliveryDetails.address}</li>
                {order.deliveryDetails.notes && <li>Notes: {order.deliveryDetails.notes}</li>}
              </ul>
              <p>
                <strong>Items:</strong>
              </p>
              <ul className="list-disc pl-5">
                {order.items.map((item) => (
                  <li key={item.productId}>
                    {item.title} - Quantity: {item.quantity} - Price: ${item.price.toFixed(2)} - Total: $
                    {item.itemTotal.toFixed(2)}
                  </li>
                ))}
              </ul>
              <p className="mt-2">
                <strong>Total Order Amount:</strong> ${order.total.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">You have no orders yet.</p>
      )}
    </div>
  );
};

export default OrdersPage;