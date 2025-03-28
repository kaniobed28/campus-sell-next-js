// src/components/Listing/ProductImage.js
import { HeartIcon } from "@heroicons/react/24/outline";
import { Carousel } from "react-responsive-carousel"; // Import carousel library
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Import carousel styles

const ProductImage = ({ image, name }) => {
  // Check if image is an array or a string
  const isArray = Array.isArray(image);

  if (isArray && image.length > 0) {
    // Render a carousel for an array of images
    return (
      <div className="relative overflow-hidden rounded-xl">
        <Carousel
          showArrows={true}
          showThumbs={false}
          infiniteLoop={true}
          autoPlay={false}
          className="w-full"
        >
          {image.map((imgUrl, index) => (
            <div key={index} className="relative">
              <img
                src={imgUrl}
                alt={`${name} - Image ${index + 1}`}
                className="w-full h-full object-cover rounded-xl transform transition-transform duration-300"
              />
              <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition">
                <HeartIcon className="w-6 h-6 text-red-500" />
              </button>
            </div>
          ))}
        </Carousel>
      </div>
    );
  }

  // Render a single image if it's a string
  if (typeof image === "string" && image) {
    return (
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
  }

  // Fallback if no valid image is provided
  return (
    <div className="relative group overflow-hidden rounded-xl bg-gray-200 flex items-center justify-center">
      <p className="text-gray-500">No image available</p>
    </div>
  );
};

export default ProductImage;