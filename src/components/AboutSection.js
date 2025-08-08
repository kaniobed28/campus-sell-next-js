import React from "react";
import { Button } from "./ui/Button";

const AboutSection = () => {
  return (
    <section className="py-20 bg-muted theme-transition">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            About Campus Sell
          </h2>
          <p className="text-lg md:text-xl mb-8 text-muted-foreground leading-relaxed">
            Campus Sell is the ultimate platform to buy, sell, and trade products within your
            campus community. We connect students, faculty, and staff to create a thriving
            marketplace that benefits everyone.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-primary-foreground">🎓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Student-Focused</h3>
              <p className="text-muted-foreground">
                Built specifically for campus communities with student needs in mind
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-accent-foreground">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Safe & Secure</h3>
              <p className="text-muted-foreground">
                Trade safely within your trusted campus community environment
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">💚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Sustainable</h3>
              <p className="text-muted-foreground">
                Promote sustainability by giving items a second life in your community
              </p>
            </div>
          </div>
          
          <div className="mt-12">
            <Button asChild variant="primary" size="lg">
              <a href="/auth">Join Our Community</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
