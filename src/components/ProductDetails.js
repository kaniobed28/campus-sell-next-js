import Link from "next/link";
import { StarIcon, ShoppingBagIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";

const ProductDetails = ({ product, onAddToCart, isLoading, isAuthenticated }) => {
  const router = useRouter();

  const handleGoToBasket = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    router.push("/basket");
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
            <Link href={`/category/${product.category}`} className="nav-link">
              {product.category}
            </Link>
          </li>
          <li>/</li>
          <li className="font-medium text-foreground">{product.name}</li>
        </ol>
      </nav>

      {/* Product Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {product.name}
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
            ${product.price}
          </p>
          <span className="text-sm text-muted-foreground">incl. VAT</span>
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
          <span className="font-medium text-card-foreground">{product.category}</span>
        </div>
        <div className="card-base p-4 rounded-lg">
          <span className="block text-sm text-muted-foreground mb-1">Subtype</span>
          <span className="font-medium text-card-foreground">{product.subcategory || 'N/A'}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3">
        <Button
          onClick={onAddToCart}
          disabled={isLoading || !isAuthenticated}
          loading={isLoading}
          variant="primary"
          size="lg"
          className="w-full"
        >
          <ShoppingBagIcon className="w-5 h-5 mr-2" />
          {isLoading ? "Adding..." : "Add to Basket"}
        </Button>
        
        <Button
          onClick={handleGoToBasket}
          variant="secondary"
          size="lg"
          className="w-full"
        >
          <ArrowRightIcon className="w-5 h-5 mr-2" />
          Go to Basket
        </Button>
        
        {!isAuthenticated && (
          <p className="text-sm text-muted-foreground text-center">
            Please{" "}
            <Link href="/auth" className="text-primary hover:text-accent theme-transition">
              sign in
            </Link>{" "}
            to add items to your basket
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
