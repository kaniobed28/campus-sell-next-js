import React from "react";
import Link from "next/link";

const ItemCard = ({ id, image, title, description, price, link, likes, views }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow">
      <img
        src={image}
        alt={title}
        className="w-full h-40 object-cover rounded-md"
      />
      <h2 className="text-lg font-semibold mt-2">{title}</h2>
      <p className="text-gray-600 mt-1">Price: ${price}</p>

      {/* Likes and Views Section */}
      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
        <span>👍 {likes} Likes</span>
        <span>👁️ {views} Views</span>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <Link
          href={link}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          View Details
        </Link>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default ItemCard;
