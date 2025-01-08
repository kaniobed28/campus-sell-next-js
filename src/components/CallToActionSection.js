import React from "react";
import Link from "next/link";

const CallToActionSection = () => {
  return (
    <section className="py-16 bg-secondart text-foreground dark:bg-primary-dark dark:text-foreground-dark">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Buy or Sell?</h2>
        <Link
          href="/categories"
          className="bg-accent text-background px-6 py-3 rounded-md font-bold hover:bg-accent-dark hover:text-white dark:bg-accent-dark dark:text-foreground dark:hover:bg-secondary-dark dark:hover:text-background transition-colors duration-300"
        >
          Explore Categories
        </Link>
      </div>
    </section>
  );
};

export default CallToActionSection;
