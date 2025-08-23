"use client";
import React, { useState } from "react";

const DateRangeSelector = ({ value, onChange, className = "" }) => {
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [showCustom, setShowCustom] = useState(false);

  const presetRanges = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "365", label: "Last year" },
    { value: "custom", label: "Custom range" }
  ];

  const handlePresetChange = (newValue) => {
    if (newValue === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onChange(newValue);
    }
  };

  const handleCustomRangeApply = () => {
    if (customRange.startDate && customRange.endDate) {
      const startDate = new Date(customRange.startDate);
      const endDate = new Date(customRange.endDate);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      onChange(`custom:${customRange.startDate}:${customRange.endDate}`, {
        startDate: customRange.startDate,
        endDate: customRange.endDate,
        days: diffDays
      });
      setShowCustom(false);
    }
  };

  const getDisplayValue = () => {
    if (typeof value === "string" && value.startsWith("custom:")) {
      const [, startDate, endDate] = value.split(":");
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    }
    
    const preset = presetRanges.find(r => r.value === value);
    return preset ? preset.label : "Last 30 days";
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Time Period
      </label>
      
      <div className="relative">
        <select
          value={typeof value === "string" && value.startsWith("custom:") ? "custom" : value}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
        >
          {presetRanges.map(range => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {showCustom && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-300 rounded-md shadow-lg z-10">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customRange.startDate}
                onChange={(e) => setCustomRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customRange.endDate}
                onChange={(e) => setCustomRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                min={customRange.startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleCustomRangeApply}
                disabled={!customRange.startDate || !customRange.endDate}
                className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
              <button
                onClick={() => setShowCustom(false)}
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display current selection */}
      <div className="mt-1 text-xs text-gray-500">
        {getDisplayValue()}
      </div>
    </div>
  );
};

export default DateRangeSelector;