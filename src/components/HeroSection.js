import React from "react";

const HeroSection = () => {
  return (
    <section className="bg-background text-foreground py-16 dark:bg-primary-dark dark:text-foreground-dark">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Campus Sell
        </h1>
        <p className="text-lg mb-6">
          Buy, sell, and trade within your campus community.
        </p>
        <div className="relative max-w-md mx-auto shadow-lg rounded-md">
          <input
            type="text"
            placeholder="Search for products, categories..."
            className="w-full px-4 py-3 rounded-l-md focus:outline-none bg-background text-foreground border border-gray-300 dark:bg-background-dark dark:text-foreground-dark dark:border-gray-700"
          />
          <button className="absolute right-0 px-4 py-3 bg-accent text-white rounded-r-md hover:bg-secondary dark:bg-accent-dark dark:hover:bg-secondary-dark">
            Search
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
