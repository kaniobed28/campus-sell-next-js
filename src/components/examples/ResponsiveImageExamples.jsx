"use client";

import React from 'react';
import ResponsiveImage from '../ResponsiveImage';
import ResponsiveImageContainer, {
  ProductImageContainer,
  HeroImageContainer,
  ThumbnailImageContainer,
  GalleryImageContainer,
  AvatarImageContainer
} from '../ResponsiveImageContainer';
import { useResponsiveImage } from '@/hooks/useResponsiveImage';

/**
 * Examples demonstrating responsive image component usage
 * This file shows various ways to use the responsive image system
 */
const ResponsiveImageExamples = () => {
  const { generateSizes, getOptimalQuality, deviceType } = useResponsiveImage();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Responsive Image Examples</h1>
        <p className="text-muted-foreground">
          Current device type: <span className="font-semibold">{deviceType}</span>
        </p>
      </div>

      {/* Basic ResponsiveImage Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Basic ResponsiveImage Component</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Square aspect ratio */}
          <div>
            <h3 className="text-lg font-medium mb-3">Square Aspect Ratio</h3>
            <ResponsiveImage
              src="https://picsum.photos/400/400?random=1"
              alt="Square image example"
              aspectRatio="square"
              className="rounded-lg"
            />
          </div>

          {/* Video aspect ratio */}
          <div>
            <h3 className="text-lg font-medium mb-3">Video Aspect Ratio</h3>
            <ResponsiveImage
              src="https://picsum.photos/800/450?random=2"
              alt="Video aspect ratio example"
              aspectRatio="video"
              className="rounded-lg"
            />
          </div>

          {/* Portrait aspect ratio */}
          <div>
            <h3 className="text-lg font-medium mb-3">Portrait Aspect Ratio</h3>
            <ResponsiveImage
              src="https://picsum.photos/300/400?random=3"
              alt="Portrait aspect ratio example"
              aspectRatio="portrait"
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Container Variants */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Image Container Variants</h2>
        
        <div className="space-y-8">
          {/* Product Images */}
          <div>
            <h3 className="text-lg font-medium mb-3">Product Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <ProductImageContainer
                  key={i}
                  src={`https://picsum.photos/300/300?random=${i + 10}`}
                  alt={`Product ${i}`}
                  onImageClick={() => alert(`Clicked product ${i}`)}
                />
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div>
            <h3 className="text-lg font-medium mb-3">Hero Image</h3>
            <HeroImageContainer
              src="https://picsum.photos/1200/600?random=20"
              alt="Hero image example"
              priority={true}
            />
          </div>

          {/* Thumbnails */}
          <div>
            <h3 className="text-lg font-medium mb-3">Thumbnail Images</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex-shrink-0 w-20 h-20">
                  <ThumbnailImageContainer
                    src={`https://picsum.photos/150/150?random=${i + 30}`}
                    alt={`Thumbnail ${i}`}
                    onImageClick={() => alert(`Clicked thumbnail ${i}`)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Images */}
          <div>
            <h3 className="text-lg font-medium mb-3">Gallery Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <GalleryImageContainer
                  key={i}
                  src={`https://picsum.photos/600/400?random=${i + 40}`}
                  alt={`Gallery image ${i}`}
                  onImageClick={() => alert(`Clicked gallery image ${i}`)}
                  overlayContent={
                    <div className="text-center">
                      <p className="text-sm font-medium">Gallery Image {i}</p>
                      <p className="text-xs opacity-80">Click to view</p>
                    </div>
                  }
                />
              ))}
            </div>
          </div>

          {/* Avatar Images */}
          <div>
            <h3 className="text-lg font-medium mb-3">Avatar Images</h3>
            <div className="flex gap-4 items-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 mb-2">
                    <AvatarImageContainer
                      src={`https://picsum.photos/100/100?random=${i + 50}`}
                      alt={`User ${i} avatar`}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">User {i}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Error Handling Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Error Handling & Fallbacks</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image with fallback */}
          <div>
            <h3 className="text-lg font-medium mb-3">With Fallback Image</h3>
            <ResponsiveImage
              src="https://invalid-url.com/image.jpg"
              alt="Image with fallback"
              fallbackSrc="https://picsum.photos/300/300?random=100"
              aspectRatio="square"
              className="rounded-lg"
            />
          </div>

          {/* No image with icon */}
          <div>
            <h3 className="text-lg font-medium mb-3">No Image (With Icon)</h3>
            <ResponsiveImage
              src=""
              alt="No image example"
              aspectRatio="square"
              showFallbackIcon={true}
              className="rounded-lg"
            />
          </div>

          {/* No image without icon */}
          <div>
            <h3 className="text-lg font-medium mb-3">No Image (No Icon)</h3>
            <ResponsiveImage
              src=""
              alt="No image example"
              aspectRatio="square"
              showFallbackIcon={false}
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Performance Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Performance Features</h2>
        
        <div className="space-y-6">
          {/* Priority loading */}
          <div>
            <h3 className="text-lg font-medium mb-3">Priority Loading (Above the fold)</h3>
            <div className="w-full max-w-md">
              <ResponsiveImage
                src="https://picsum.photos/400/300?random=200"
                alt="Priority loaded image"
                aspectRatio="landscape"
                priority={true}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Custom sizes */}
          <div>
            <h3 className="text-lg font-medium mb-3">Custom Sizes Attribute</h3>
            <div className="w-full max-w-md">
              <ResponsiveImage
                src="https://picsum.photos/600/400?random=201"
                alt="Custom sizes example"
                aspectRatio="landscape"
                sizes="(max-width: 768px) 100vw, 50vw"
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Quality optimization */}
          <div>
            <h3 className="text-lg font-medium mb-3">Quality Optimization</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Current optimal quality: {getOptimalQuality(75)}% (base: 75%)
            </p>
            <div className="w-full max-w-md">
              <ResponsiveImage
                src="https://picsum.photos/400/400?random=202"
                alt="Quality optimized image"
                aspectRatio="square"
                quality={75}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Sizes Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Generated Sizes Examples</h2>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Grid Layout Sizes:</h3>
            <code className="text-sm">{generateSizes('grid')}</code>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Hero Layout Sizes:</h3>
            <code className="text-sm">{generateSizes('hero')}</code>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Thumbnail Layout Sizes:</h3>
            <code className="text-sm">{generateSizes('thumbnail')}</code>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResponsiveImageExamples;