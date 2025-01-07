import React from "react";

const HeroSection = () => {
  return (
    <section className="bg-blue-600 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Campus Sell</h1>
        <p className="text-lg mb-6">Buy, sell, and trade within your campus community.</p>
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search for products, categories..."
            className="w-full px-4 py-3 border-none rounded-l-md focus:outline-none text-gray-800"
          />
          <button className="absolute right-0 px-4 py-3 bg-red-500 text-white rounded-r-md hover:bg-red-600">
            Search
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
