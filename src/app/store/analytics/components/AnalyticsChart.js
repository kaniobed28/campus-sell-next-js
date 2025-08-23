"use client";
import React from "react";

const AnalyticsChart = ({ 
  data, 
  type = "line", 
  title, 
  height = "200px",
  color = "#3B82F6" 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Simple SVG-based chart implementation
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const chartWidth = 400;
  const chartHeight = 150;
  const padding = 40;

  const getX = (index) => padding + (index * (chartWidth - 2 * padding)) / (data.length - 1);
  const getY = (value) => chartHeight - padding - ((value - minValue) / range) * (chartHeight - 2 * padding);

  const pathData = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="relative">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const value = Math.round(minValue + ratio * range);
            const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
            return (
              <g key={index}>
                <text x={padding - 10} y={y + 4} textAnchor="end" className="text-xs fill-gray-500">
                  {value}
                </text>
                <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#e5e7eb" strokeWidth="1"/>
              </g>
            );
          })}
          
          {/* Chart line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {data.map((point, index) => (
            <circle
              key={index}
              cx={getX(index)}
              cy={getY(point.value)}
              r="4"
              fill={color}
              className="drop-shadow-sm"
            >
              <title>{`${point.label}: ${point.value}`}</title>
            </circle>
          ))}
          
          {/* X-axis labels */}
          {data.map((point, index) => {
            if (index % Math.ceil(data.length / 6) === 0) { // Show every nth label to avoid crowding
              return (
                <text
                  key={index}
                  x={getX(index)}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {point.label}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
      
      {/* Chart summary */}
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>Min: {minValue}</span>
        <span>Max: {maxValue}</span>
        <span>Avg: {Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length)}</span>
      </div>
    </div>
  );
};

export default AnalyticsChart;