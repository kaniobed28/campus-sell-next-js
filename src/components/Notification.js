// src/components/Notification.js
import React from "react";
import { cn } from "../lib/utils";

const Notification = ({ 
  type = "info", 
  message, 
  title,
  dismissible = false,
  onDismiss,
  className 
}) => {
  if (!message) return null;

  const typeStyles = {
    error: {
      container: "bg-destructive/10 border-destructive/20 text-destructive",
      icon: "❌",
    },
    success: {
      container: "bg-success/10 border-success/20 text-success",
      icon: "✅",
    },
    warning: {
      container: "bg-warning/10 border-warning/20 text-warning",
      icon: "⚠️",
    },
    info: {
      container: "bg-info/10 border-info/20 text-info",
      icon: "ℹ️",
    },
  };

  const currentStyle = typeStyles[type] || typeStyles.info;

  return (
    <div 
      className={cn(
        "border rounded-md px-4 py-3 mb-4 theme-transition",
        currentStyle.container,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0" aria-hidden="true">
          {currentStyle.icon}
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium mb-1">{title}</h4>
          )}
          <p className="text-sm">{message}</p>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 ml-2 text-current hover:opacity-70 focus-ring rounded"
            aria-label="Dismiss notification"
          >
            <span className="text-lg">×</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;