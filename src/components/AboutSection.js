import React from "react";
import { Button } from "./ui/Button";
import { useViewport, useResponsiveSpacing } from "@/hooks/useViewport";

const AboutSection = () => {
  const { isMobile, isTablet } = useViewport();
  const spacing = useResponsiveSpacing();

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted theme-transition">
      <div className={`container mx-auto ${spacing.container}`}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Responsive heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-foreground">
            About Campus Sell
          </h2>
          
          {/* Responsive description */}
          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 text-muted-foreground leading-relaxed px-2 sm:px-0">
            Campus Sell is the ultimate platform to buy, sell, and trade products within your
            campus community. We connect students, faculty, and staff to create a thriving
            marketplace that benefits everyone.
          </p>
          
          {/* Responsive feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
            <div className="text-center p-4 sm:p-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl text-primary-foreground">🎓</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Student-Focused</h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Built specifically for campus communities with student needs in mind
              </p>
            </div>
            
            <div className="text-center p-4 sm:p-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl text-accent-foreground">🔒</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Safe & Secure</h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Trade safely within your trusted campus community environment
              </p>
            </div>
            
            <div className="text-center p-4 sm:p-0 sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl text-white">💚</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">Sustainable</h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Promote sustainability by giving items a second life in your community
              </p>
            </div>
          </div>
          
          {/* Responsive CTA button */}
          <div className="mt-8 sm:mt-12">
            <Button 
              asChild 
              variant="primary" 
              size={isMobile ? "default" : "lg"}
              className="w-full sm:w-auto min-h-[48px] text-base font-medium"
            >
              <a href="/auth">Join Our Community</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
