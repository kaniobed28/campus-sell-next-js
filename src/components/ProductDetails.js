import Link from "next/link";
import { StarIcon, ShoppingBagIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation"; // Import the useRouter hook

const ProductDetails = ({ product, onAddToCart, isLoading, isAuthenticated }) => {
  const router = useRouter(); // Initialize the router

  const handleGoToBasket = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    router.push("/basket");
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="mb-6">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li><Link href={`/category/${product.category}`} className="hover:text-blue-600">{product.category}</Link></li>
            <li>/</li>
            <li className="font-medium text-gray-900">{product.name}</li>
          </ol>
        </nav>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={`w-5 h-5 ${i < 4 ? "text-yellow-400" : "text-gray-300"}`} />
            ))}
          </div>
          <span className="text-gray-500">(142 reviews)</span>
        </div>
        <p className="text-3xl font-bold text-blue-600 mb-6">
          ${product.price}
          <span className="text-sm text-gray-500 ml-2">incl. VAT</span>
        </p>
        <p className="text-gray-700 text-lg leading-relaxed mb-6">{product.description}</p>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="block text-sm text-gray-500 mb-1">Category</span>
            <span className="font-medium">{product.category}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="block text-sm text-gray-500 mb-1">Subtype</span>
            <span className="font-medium">{product.subcategory}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-4">
        <button
          onClick={onAddToCart}
          disabled={isLoading || !isAuthenticated}
          className={`bg-blue-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-3 hover:bg-blue-700 transition-transform transform hover:scale-[1.02] ${
            isLoading || !isAuthenticated ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          <ShoppingBagIcon className="w-6 h-6" />
          <span>{isLoading ? "Adding..." : "Add to Basket"}</span>
        </button>
        <button
          onClick={handleGoToBasket} // Add the handleGoToBasket function to this button's onClick
          className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-3 hover:bg-emerald-700 transition-transform transform hover:scale-[1.02]"
        >
          <ArrowRightIcon className="w-6 h-6" />
          <span>Go to Basket</span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
