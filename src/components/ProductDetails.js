import Link from "next/link";
import { StarIcon, ShoppingBagIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import AddToBasketButton from "./AddToBasketButton";

// Create a local version of the slug generator that handles edge cases
const generateCategorySlug = (name) => {
  // Handle null, undefined or non-string values
  if (!name || typeof name !== 'string') {
    return 'uncategorized';
  }
  
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const ProductDetails = ({ product, onAddToCart, isLoading, isAuthenticated }) => {
  const router = useRouter();

  const handleContactSeller = () => {
    // TODO: Implement contact seller functionality
    alert("Contact seller functionality would be implemented here");
  };

  // Generate category slug if not provided
  const getCategorySlug = () => {
    if (product.categorySlug) {
      return product.categorySlug;
    }
    // Generate slug from category name if available
    if (product.category) {
      return generateCategorySlug(product.category);
    }
    // Fallback for missing category data
    return 'uncategorized';
  };

  return (
    <div className="flex flex-col justify-center space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="nav-link">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/categories/${getCategorySlug()}`} className="nav-link">
              {product.category}
            </Link>
          </li>
          <li>/</li>
          <li className="font-medium text-foreground">{product.title || product.name || 'Untitled Product'}</li>
        </ol>
      </nav>

      {/* Product Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {product.title || product.name || 'Untitled Product'}
        </h1>
        
        {/* Rating */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon 
                key={i} 
                className={`w-5 h-5 ${i < 4 ? "text-warning fill-current" : "text-muted"}`} 
              />
            ))}
          </div>
          <span className="text-muted-foreground text-sm">(142 reviews)</span>
        </div>

        {/* Price */}
        <div className="mb-6">
          <p className="text-3xl font-bold text-primary mb-1">
            ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || 0).toFixed(2)}
          </p>
          <span className="text-sm text-muted-foreground">Price negotiable</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="text-foreground text-lg leading-relaxed mb-6">
          {product.description}
        </p>
      </div>

      {/* Product Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card-base p-4 rounded-lg">
          <span className="block text-sm text-muted-foreground mb-1">Category</span>
          <span className="font-medium text-card-foreground">{product.category || 'Uncategorized'}</span>
        </div>
        <div className="card-base p-4 rounded-lg">
          <span className="block text-sm text-muted-foreground mb-1">Condition</span>
          <span className="font-medium text-card-foreground">{product.condition || 'Good'}</span>
        </div>
        <div className="card-base p-4 rounded-lg">
          <span className="block text-sm text-muted-foreground mb-1">Location</span>
          <span className="font-medium text-card-foreground">{product.location || 'Campus'}</span>
        </div>
        <div className="card-base p-4 rounded-lg">
          <span className="block text-sm text-muted-foreground mb-1">Listed</span>
          <span className="font-medium text-card-foreground">
            {product.createdAt ? new Date(product.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3">
        <AddToBasketButton
          product={product}
          variant="primary"
          size="lg"
          className="w-full"
        >
          <ShoppingBagIcon className="w-5 h-5 mr-2" />
          Add to Basket
        </AddToBasketButton>
        
        <Button
          onClick={handleContactSeller}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          <ArrowRightIcon className="w-5 h-5 mr-2" />
          Contact Seller
        </Button>
      </div>
    </div>
  );
};

export default ProductDetails;