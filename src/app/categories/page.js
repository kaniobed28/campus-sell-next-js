"use client";
import React from "react";
import CategoryBrowser from "@/components/CategoryBrowser";

const CategoriesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <CategoryBrowser 
          viewMode="grid"
          showSearch={true}
          showProductCounts={true}
          maxColumns={3}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default CategoriesPage;
