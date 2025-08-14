import React, { useState } from "react";
import { Button } from "../../../components/ui/Button";

const FileUpload = ({ label, id, onChange, required = false }) => {
  const [fileNames, setFileNames] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const names = files.map((file) => file.name);

    setFileNames((prev) => [...prev, ...names]);
    onChange(files);
    e.target.value = "";
  };

  const removeFile = (indexToRemove) => {
    setFileNames((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="mb-6">
      <label htmlFor={id} className="form-label mb-2 block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      
      <div className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent theme-transition">
          <input
            type="file"
            id={id}
            accept="image/*"
            multiple
            onChange={handleFileChange}
            required={fileNames.length === 0 && required}
            className="hidden"
          />
          <div className="space-y-2">
            <svg className="w-12 h-12 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <Button asChild variant="outline" size="sm">
                <label htmlFor={id} className="cursor-pointer">
                  Choose Images
                </label>
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                or drag and drop images here
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to 10MB each
            </p>
          </div>
        </div>

        {/* File List */}
        {fileNames.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              Selected Files ({fileNames.length})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {fileNames.map((name, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-foreground truncate">{name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 text-muted-foreground hover:text-destructive theme-transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;


