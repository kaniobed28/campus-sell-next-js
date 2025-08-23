"use client";
import React from "react";
import { PRODUCT_STATUS } from "@/types/store";

const StatusIndicator = ({ 
  status, 
  size = "sm", 
  showIcon = true, 
  showTooltip = true,
  className = "" 
}) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case PRODUCT_STATUS.ACTIVE:
        return {
          label: "Active",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "✅",
          description: "Visible to buyers and searchable",
          dotColor: "bg-green-500"
        };
      case PRODUCT_STATUS.SOLD:
        return {
          label: "Sold",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: "💰",
          description: "Hidden from search, kept in history",
          dotColor: "bg-blue-500"
        };
      case PRODUCT_STATUS.UNAVAILABLE:
        return {
          label: "Unavailable",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "⏸️",
          description: "Temporarily hidden, can be reactivated",
          dotColor: "bg-yellow-500"
        };
      case PRODUCT_STATUS.DRAFT:
        return {
          label: "Draft",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "📝",
          description: "Not visible to buyers, work in progress",
          dotColor: "bg-gray-500"
        };
      default:
        return {
          label: "Active",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "✅",
          description: "Visible to buyers and searchable",
          dotColor: "bg-green-500"
        };
    }
  };

  const config = getStatusConfig(status || PRODUCT_STATUS.ACTIVE);
  
  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  const dotSizeClasses = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3"
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.color} ${sizeClasses[size]} ${className}`}
      title={showTooltip ? config.description : undefined}
    >
      {showIcon && (
        <span className="mr-1">
          <span className={`inline-block rounded-full ${config.dotColor} ${dotSizeClasses[size]} mr-1`}></span>
        </span>
      )}
      {config.label}
    </span>
  );
};

export default StatusIndicator;