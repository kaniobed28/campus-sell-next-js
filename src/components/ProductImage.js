// src/components/Listing/ProductImage.js
import { HeartIcon } from "@heroicons/react/24/outline";

const ProductImage = ({ image, name }) => (
  <div className="relative group overflow-hidden rounded-xl">
    <img
      src={image}
      alt={name}
      className="w-full h-full object-cover rounded-xl transform transition-transform duration-300 group-hover:scale-105"
    />
    <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition">
      <HeartIcon className="w-6 h-6 text-red-500" />
    </button>
  </div>
);

export default ProductImage;