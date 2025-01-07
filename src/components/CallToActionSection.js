import React from "react";
import Link from "next/link";

const CallToActionSection = () => {
  return (
    <section className="py-16 bg-blue-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Buy or Sell?</h2>
        <Link
          href="/categories"
          className="bg-white text-blue-600 px-6 py-3 rounded-md font-bold hover:bg-gray-100"
        >
          Explore Categories
        </Link>
      </div>
    </section>
  );
};

export default CallToActionSection;
