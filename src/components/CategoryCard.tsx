"use client";
import React from 'react';
import Link from 'next/link';
import { Category } from '@/types/category';

interface CategoryCardProps {
  category: Category;
  showProductCount?: boolean;
  showDescription?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  showProductCount = true,
  showDescription = true,
  size = 'medium',
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-4 text-sm';
      case 'large':
        return 'p-8 text-lg';
      default:
        return 'p-6 text-base';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'text-2xl';
      case 'large':
        return 'text-5xl';
      default:
        return 'text-4xl';
    }
  };

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={`
        block card-base rounded-xl hover:shadow-lg transition-all duration-300 group
        ${getSizeClasses()}
        ${className}
      `}
    >
      <div className="text-center">
        {/* Category Icon */}
        <div className={`${getIconSize()} mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {category.icon || '📁'}
        </div>
        
        {/* Category Name */}
        <h3 className={`font-semibold mb-2 text-card-foreground group-hover:text-primary transition-colors ${
          size === 'small' ? 'text-base' : size === 'large' ? 'text-2xl' : 'text-lg'
        }`}>
          {category.name}
        </h3>
        
        {/* Description */}
        {showDescription && category.description && (
          <p className={`text-muted-foreground mb-3 line-clamp-2 ${
            size === 'small' ? 'text-xs' : 'text-sm'
          }`}>
            {category.description}
          </p>
        )}
        
        {/* Product Count */}
        {showProductCount && (
          <div className={`text-muted-foreground ${
            size === 'small' ? 'text-xs' : 'text-sm'
          }`}>
            {category.metadata.productCount} {category.metadata.productCount === 1 ? 'product' : 'products'}
          </div>
        )}
      </div>
    </Link>
  );
};

export default CategoryCard;