"use client";
import React from "react";

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon, 
  color = "blue",
  subtitle,
  trend = null 
}) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-500 text-blue-600",
      green: "bg-green-500 text-green-600",
      orange: "bg-orange-500 text-orange-600",
      purple: "bg-purple-500 text-purple-600",
      red: "bg-red-500 text-red-600",
      yellow: "bg-yellow-500 text-yellow-600",
      gray: "bg-gray-500 text-gray-600"
    };
    return colors[color] || colors.blue;
  };

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case "positive":
        return "↗️";
      case "negative":
        return "↘️";
      default:
        return "➡️";
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            {icon && (
              <div className={`w-8 h-8 ${colorClasses.split(' ')[0]} rounded-full flex items-center justify-center mr-3`}>
                <span className="text-white font-bold text-sm">{icon}</span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          
          {change !== undefined && (
            <div className="mt-2 flex items-center">
              <span className={`text-sm font-medium ${getChangeColor(changeType)}`}>
                {getChangeIcon(changeType)} {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last period</span>
            </div>
          )}
        </div>
        
        {trend && (
          <div className="ml-4">
            <div className="w-16 h-8">
              <svg width="100%" height="100%" viewBox="0 0 64 32">
                <path
                  d={trend.path}
                  fill="none"
                  stroke={changeType === "positive" ? "#10B981" : changeType === "negative" ? "#EF4444" : "#6B7280"}
                  strokeWidth="2"
                  className="opacity-60"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;