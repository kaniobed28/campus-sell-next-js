import React from "react";
import Link from "next/link";

const SellerPromptModal = ({ isOpen, onClose, message, primaryAction, secondaryAction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        {/* Message */}
        <p className="text-gray-800 dark:text-gray-200 text-lg mb-4">{message}</p>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          {secondaryAction && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition"
            >
              {secondaryAction.label || "Cancel"}
            </button>
          )}
          {primaryAction && (
            primaryAction.href ? (
              <Link
                href={primaryAction.href}
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {primaryAction.label}
              </Link>
            ) : (
              <button
                onClick={() => {
                  primaryAction.onClick();
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {primaryAction.label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerPromptModal;