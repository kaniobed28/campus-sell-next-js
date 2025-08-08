import React from "react";
import Link from "next/link";
import { Button } from "./ui/Button";

const ItemCard = ({ id, image, title, description, price, link, likes, views }) => {
  return (
    <div className="card-base rounded-lg p-4 hover:shadow-md group">
      <div className="relative overflow-hidden rounded-md mb-3">
        <img
          src={image}
          alt={title}
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-card-foreground line-clamp-1">{title}</h2>
        <p className="text-xl font-bold text-primary">${price}</p>

        {/* Likes and Views Section */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="text-base">👍</span>
            {likes} Likes
          </span>
          <span className="flex items-center gap-1">
            <span className="text-base">👁️</span>
            {views} Views
          </span>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}

        <div className="pt-2">
          <Button asChild variant="primary" size="sm" className="w-full">
            <Link href={link}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
