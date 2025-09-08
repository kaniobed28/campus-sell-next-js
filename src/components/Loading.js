// components/Loading.js
import React from "react";

const Loading = ({ message = "Loading, please wait...", size = "lg" }) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-background">
      <div className="text-4xl font-bold text-primary mb-6 tracking-wide">
        CAMPUS SELL
      </div>
      <div 
        className={`loading-spinner rounded-full mb-4 ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      <div className={`text-muted-foreground ${textSizeClasses[size]}`}>
        {message}
      </div>
    </div>
  );
};

export default Loading;
