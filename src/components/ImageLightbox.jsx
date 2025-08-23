import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ImageLightbox = ({ isOpen, onClose, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goToNext();
      else if (e.key === "ArrowLeft") goToPrevious();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (!isOpen || !images?.length) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
        >
          <motion.button
            className="absolute top-4 right-4 text-white text-3xl font-bold z-10 hover:text-gray-300"
            onClick={onClose}
          >
            &times;
          </motion.button>

          <motion.button
            className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white text-4xl z-10 hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
          >
            &#10094;
          </motion.button>

          <motion.button
            className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white text-4xl z-10 hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          >
            &#10095;
          </motion.button>

          <motion.div
            className="relative max-w-5xl max-h-screen flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain shadow-lg rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          <motion.div className="absolute bottom-6 flex space-x-2">
            {images.map((_, index) => (
              <motion.button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-white" : "bg-gray-500"
                } hover:bg-gray-300`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;
