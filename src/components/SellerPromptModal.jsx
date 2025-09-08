import React from "react";
import Link from "next/link";

const SellerPromptModal = ({ isOpen, onClose, message, primaryAction, secondaryAction }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-card rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
        {/* Message */}
        <p className="text-foreground text-lg mb-4">{message}</p>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          {secondaryAction && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition"
            >
              {secondaryAction.label || "Cancel"}
            </button>
          )}
          {primaryAction && (
            primaryAction.href ? (
              <Link
                href={primaryAction.href}
                onClick={onClose}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
              >
                {primaryAction.label}
              </Link>
            ) : (
              <button
                onClick={() => {
                  primaryAction.onClick();
                  onClose();
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition"
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