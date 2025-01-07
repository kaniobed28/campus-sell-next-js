import React, { useState } from "react";

const FileUpload = ({ label, id, onChange, required = false }) => {
  const [fileNames, setFileNames] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to Array
    const names = files.map((file) => file.name); // Extract file names

    // Append new files to the existing list
    setFileNames((prev) => [...prev, ...names]);

    // Pass the new files to the parent component via onChange
    onChange(e);
    
    // Clear the input value to allow re-selecting the same file
    e.target.value = "";
  };

  return (
    <div className="mb-6">
      <label htmlFor={id} className="block text-gray-700 font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-4">
        <input
          type="file"
          id={id}
          accept="image/*"
          onChange={handleFileChange}
          required={fileNames.length === 0 && required} // Required only if no files are uploaded yet
          className="hidden"
        />
        <label
          htmlFor={id}
          className="flex items-center justify-center w-full max-w-xs px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Add File
        </label>
      </div>
      <div className="mt-2">
        {fileNames.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-gray-500">
            {fileNames.map((name, index) => (
              <li key={index} className="truncate max-w-full">
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No file selected</p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
