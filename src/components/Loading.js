// components/Loading.js
import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="text-4xl font-bold text-blue-600 mb-4">CAMPUS SELL</div>
      <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-blue-600 border-t-transparent mb-4" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      <div className="text-lg text-gray-700">Loading, please wait...</div>
    </div>
  );
};

export default Loading;
