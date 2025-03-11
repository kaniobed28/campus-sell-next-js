"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/stores/useAuth";
import Loading from "@/components/Loading";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, orderBy } from "firebase/firestore";

const CompanyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const fetchUserProfileAndOrders = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch user profile to get companyId
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
          throw new Error("User profile not found.");
        }

        const userData = userDocSnap.data();
        const fetchedCompanyId = userData.companyId;

        if (!fetchedCompanyId) {
          throw new Error("You are not associated with a delivery company.");
        }

        setCompanyId(fetchedCompanyId);

        // Fetch orders for this company
        let ordersQuery = query(
          collection(db, "orders"),
          where("deliveryCompanyId", "==", fetchedCompanyId),
          orderBy("createdAt", "desc")
        );

        if (statusFilter !== "all") {
          ordersQuery = query(
            collection(db, "orders"),
            where("deliveryCompanyId", "==", fetchedCompanyId),
            where("status", "==", statusFilter),
            orderBy("createdAt", "desc")
          );
        }

        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (ordersData.length === 0) {
          setOrders([]);
          setIsLoading(false);
          return;
        }

        // Fetch product details
        const productIdsSet = new Set();
        ordersData.forEach((order) => {
          order.items.forEach((item) => productIdsSet.add(item.productId));
        });
        const productIds = Array.from(productIdsSet);

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

        // Enrich orders
        const enrichedOrders = ordersData.map((order) => {
          let total = 0;
          const enrichedItems = order.items.map((item) => {
            const product = productsMap[item.productId] || {
              title: "Product not found",
              price: 0,
            };
            const price = typeof product.price === "string" ? parseFloat(product.price) || 0 : product.price;
            const itemTotal = price * (item.quantity || 1);
            total += itemTotal;
            return {
              productId: item.productId,
              quantity: item.quantity || 1,
              title: product.title,
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
        console.error("Error in fetchUserProfileAndOrders:", err);
        setError(err.message || "Failed to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchUserProfileAndOrders();
    }
  }, [user, authLoading, statusFilter]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      alert(`Order ${orderId} status updated to "${newStatus}"`);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status. Please try again.");
    }
  };

  if (authLoading || isLoading) return <Loading />;
  if (!user) {
    router.push("/auth");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Company Orders</h1>
      {error && <p className="text-center text-red-600 mb-4">{error}</p>}

      <div className="mb-6 flex justify-center">
        <label htmlFor="statusFilter" className="mr-2 font-medium">
          Filter by Status:
        </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Order ID: {order.id}</h2>
                <div className="flex items-center space-x-2">
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
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
              <p>
                <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}
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
        <p className="text-center text-gray-600">
          {statusFilter === "all"
            ? "No orders assigned to your company yet."
            : `No ${statusFilter} orders assigned to your company.`}
        </p>
      )}
    </div>
  );
};

export default CompanyOrdersPage;