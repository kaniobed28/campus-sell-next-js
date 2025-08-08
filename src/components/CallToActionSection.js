import React from "react";
import { Button } from "./ui/Button";

const CallToActionSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-accent theme-transition">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-foreground">
            Ready to Buy or Sell?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
            Join thousands of students already using Campus Sell to find great deals
            and earn money from items they no longer need.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              variant="secondary" 
              size="lg"
              className="min-w-[180px] bg-white text-primary hover:bg-white/90"
            >
              <a href="/listings">Start Shopping</a>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="min-w-[180px] border-white text-white hover:bg-white hover:text-primary"
            >
              <a href="/sell">List an Item</a>
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-primary-foreground/80">
            <div className="text-center">
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm">Items Sold</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">95%</div>
              <div className="text-sm">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
