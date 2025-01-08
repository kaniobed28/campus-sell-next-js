import React from "react";
import Link from "next/link";

const ItemCard = ({ id, image, title, description, link }) => {
  return (
    <div className="bg-background text-foreground shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 dark:bg-secondary-dark dark:text-foreground-dark">
      <img
        src={image}
        alt={title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-xl mb-2">{title}</h3>
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{description}</p>
        <Link
          href={link}
          className="text-accent hover:text-accent-dark font-medium hover:underline dark:text-accent-dark"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ItemCard;
