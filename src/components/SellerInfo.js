import React from "react";

const SellerInfo = ({ seller }) => {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800">Seller Information</h3>
      {seller ? (
        <div className="mt-2 text-sm text-gray-600">
          <p><strong>Name:</strong> {seller.fullName || "N/A"}</p>
          <p><strong>Email:</strong> {seller.email || "Not provided"}</p>
          <p><strong>Phone:</strong> {seller.phoneNumber || "Not provided"}</p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">Seller information not available.</p>
      )}
    </div>
  );
};

export default SellerInfo;