"use client";
import React from "react";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedListingsSection from "@/components/FeaturedListingsSection";
import AboutSection from "@/components/AboutSection";
import CallToActionSection from "@/components/CallToActionSection";
import TrendingProductsSection from "@/components/TrendingProductsSection";

const Home = () => {
  return (
    <div className="bg-gray-50">
      <HeroSection />
      <CategoriesSection />
      <FeaturedListingsSection />
      <TrendingProductsSection/>
      <AboutSection />
      <CallToActionSection />
    </div>
  );
};

export default Home;




