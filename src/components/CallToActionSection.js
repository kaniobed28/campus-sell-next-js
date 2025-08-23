import React from "react";
import { Button } from "./ui/Button";
import { useViewport, useResponsiveSpacing } from "@/hooks/useViewport";

const CallToActionSection = () => {
  const { isMobile, isTablet } = useViewport();
  const spacing = useResponsiveSpacing();

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary to-accent theme-transition">
      <div className={`container mx-auto ${spacing.container} text-center`}>
        <div className="max-w-3xl mx-auto">
          {/* Responsive heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-primary-foreground leading-tight">
            Ready to Buy or Sell?
          </h2>
          
          {/* Responsive description */}
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-primary-foreground/90 leading-relaxed px-2 sm:px-0">
            Join thousands of students already using Campus Sell to find great deals
            and earn money from items they no longer need.
          </p>
          
          {/* Responsive CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
            <Button 
              asChild 
              variant="secondary" 
              size={isMobile ? "default" : "lg"}
              className="w-full sm:w-auto min-w-[180px] min-h-[48px] bg-white text-primary hover:bg-white/90 font-medium"
            >
              <a href="/listings">Start Shopping</a>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size={isMobile ? "default" : "lg"}
              className="w-full sm:w-auto min-w-[180px] min-h-[48px] border-white text-white hover:bg-white hover:text-primary font-medium"
            >
              <a href="/sell">List an Item</a>
            </Button>
          </div>
          
          {/* Responsive stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-primary-foreground/80">
            <div className="text-center py-2">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">10K+</div>
              <div className="text-sm sm:text-base">Active Users</div>
            </div>
            <div className="text-center py-2">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">50K+</div>
              <div className="text-sm sm:text-base">Items Sold</div>
            </div>
            <div className="text-center py-2">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">95%</div>
              <div className="text-sm sm:text-base">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
