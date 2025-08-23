import Link from "next/link";
import { HeartIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const RelatedProducts = ({ products, category }) => {
  if (products.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Related Products</h2>
        <Link
          href={`/category/${category}`}
          className="text-blue-600 hover:underline flex items-center font-medium"
        >
          View All <ArrowRightIcon className="w-5 h-5 ml-2" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((related) => {
          // Normalize image: use first URL from imageUrls if present, otherwise use image
          const displayImage =
            Array.isArray(related.imageUrls) && related.imageUrls.length > 0
              ? related.imageUrls[0]
              : related.image || "/default-image.jpg";

          return (
            <div
              key={related.id}
              className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition duration-300"
            >
              <div className="relative group overflow-hidden rounded-lg mb-4">
                <img
                  src={displayImage}
                  alt={related.name}
                  className="w-full h-52 object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-105"
                />
                <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition">
                  <HeartIcon className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg truncate">
                {related.name}
              </h3>
              <p className="text-blue-700 font-bold text-xl mt-2 p-1 bg-blue-100 inline-block rounded-lg">
                ${Number(related.price).toFixed(2)}
              </p>
              <Link
                href={`/listings/${related.id}`}
                className="mt-4 inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                View Details <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedProducts;