import Link from "next/link";
import { HeartIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const RelatedProducts = ({ products, category }) => {
  if (products.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-foreground">Related Products</h2>
        <Link
          href={`/category/${category}`}
          className="text-primary hover:text-accent flex items-center font-medium theme-transition"
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
              className="card-base p-5 rounded-xl shadow-md border hover:shadow-lg transition duration-300"
            >
              <div className="relative group overflow-hidden rounded-lg mb-4">
                <img
                  src={displayImage}
                  alt={related.name}
                  className="w-full h-52 object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-105"
                />
                <button className="absolute top-4 right-4 p-2 bg-card/80 hover:bg-card rounded-full shadow-md theme-transition focus-ring">
                  <HeartIcon className="w-6 h-6 text-destructive" />
                </button>
              </div>
              <h3 className="font-semibold text-card-foreground text-lg truncate">
                {related.name}
              </h3>
              <p className="text-primary font-bold text-xl mt-2 p-1 bg-primary/10 inline-block rounded-lg">
                ${Number(related.price).toFixed(2)}
              </p>
              <Link
                href={`/listings/${related.id}`}
                className="mt-4 inline-flex items-center text-primary font-medium hover:text-accent transition-colors theme-transition"
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