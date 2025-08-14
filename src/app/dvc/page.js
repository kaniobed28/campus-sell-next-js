"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../stores/useAuth";
import Loading from "@/components/Loading";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const DeliveryCompaniesPage = () => {
  const [deliveryCompanies, setDeliveryCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchDeliveryCompanies = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all delivery companies
        const deliveryCompaniesSnapshot = await getDocs(collection(db, "deliveryCompanies"));
        const companiesData = deliveryCompaniesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (companiesData.length === 0) {
          setDeliveryCompanies([]);
          setIsLoading(false);
          return;
        }

        setDeliveryCompanies(companiesData);
      } catch (err) {
        console.error("Error fetching delivery companies:", err);
        setError("Failed to load delivery companies. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchDeliveryCompanies();
    }
  }, [authLoading]);

  // Handle loading and authentication states
  if (authLoading || isLoading) return <Loading />;
  if (!user) {
    router.push("/auth");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Delivery Companies</h1>
      {error && <p className="text-center text-red-600 mb-4">{error}</p>}
      {deliveryCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveryCompanies.map((company) => (
            <div key={company.id} className="border rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold mb-2">{company.name}</h2>
              <p>
                <strong>ID:</strong> {company.id}
              </p>
              <p>
                <strong>Contact:</strong> {company.contactInfo || "Not provided"}
              </p>
              <p>
                <strong>Delivery Areas:</strong>{" "}
                {company.deliveryAreas?.join(", ") || "All areas"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`${
                    company.status === "active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {company.status || "Unknown"}
                </span>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No delivery companies found.</p>
      )}
    </div>
  );
};

export default DeliveryCompaniesPage;



<<<<<<< HEAD

=======
>>>>>>> 9729b63 (bug space added 2 time)
