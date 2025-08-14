// src/components/ProductImage.js
import { HeartIcon } from "@heroicons/react/24/outline";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import ResponsiveImage from "./ResponsiveImage";

const ProductImage = ({ image, name }) => {
  const isArray = Array.isArray(image);

  if (isArray && image.length > 0) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-card">
        <Carousel
          showArrows={true}
          showThumbs={false}
          infiniteLoop={true}
          autoPlay={false}
          className="w-full"
          renderArrowPrev={(onClickHandler, hasPrev, label) =>
            hasPrev && (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-card/90 hover:bg-card rounded-full shadow-md theme-transition focus-ring"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )
          }
          renderArrowNext={(onClickHandler, hasNext, label) =>
            hasNext && (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-card/90 hover:bg-card rounded-full shadow-md theme-transition focus-ring"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )
          }
        >
          {image.map((imgUrl, index) => (
            <div key={index} className="relative">
              <ResponsiveImage
                src={imgUrl}
                alt={`${name} - Image ${index + 1}`}
                aspectRatio="square"
                className="rounded-xl"
                containerClassName="aspect-square"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <button className="absolute top-4 right-4 p-2 bg-card/90 hover:bg-card rounded-full shadow-md theme-transition focus-ring">
                <HeartIcon className="w-5 h-5 text-destructive" />
              </button>
            </div>
          ))}
        </Carousel>
      </div>
    );
  }

  if (typeof image === "string" && image) {
    return (
      <div className="relative group overflow-hidden rounded-xl bg-card">
        <ResponsiveImage
          src={image}
          alt={name}
          aspectRatio="square"
          className="rounded-xl transform transition-transform duration-300 group-hover:scale-105"
          priority={true}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <button className="absolute top-4 right-4 p-2 bg-card/90 hover:bg-card rounded-full shadow-md theme-transition focus-ring">
          <HeartIcon className="w-5 h-5 text-destructive" />
        </button>
      </div>
    );
  }

  // Fallback if no valid image is provided
  return (
    <div className="relative group overflow-hidden rounded-xl bg-muted flex items-center justify-center aspect-square">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-2 bg-muted-foreground/20 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-muted-foreground text-sm">No image available</p>
      </div>
    </div>
  );
};

export default ProductImage;