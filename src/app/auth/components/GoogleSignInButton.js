import React from "react";
import { Button } from "../../../components/ui/Button";

const GoogleSignInButton = ({
  onClick,
  text = "Continue with Google",
  loading = false,
}) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="lg"
      className="w-full"
      loading={loading}
      disabled={loading}
    >
      {!loading && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 mr-2"
          viewBox="0 0 48 48"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.19 0 5.91 1.1 8.11 2.89l6.07-6.08C34.64 3.44 29.68 1.5 24 1.5c-7.34 0-13.63 4.17-16.96 10.29l7.55 5.85C16.69 13.16 20.1 9.5 24 9.5z"
          />
          <path
            fill="#34A853"
            d="M46.5 24c0-1.55-.14-3.05-.41-4.5H24v9h13c-.56 3-2.23 5.53-4.73 7.24l7.35 5.69C43.55 38.18 46.5 31.55 46.5 24z"
          />
          <path
            fill="#4A90E2"
            d="M9.58 28.96C7.9 26.39 6.88 23.33 6.88 20c0-3.33 1.03-6.39 2.7-8.96L2.03 5.29C-1.39 11.41-1.5 19.84 1.59 26.15l7.99-6.19z"
          />
          <path
            fill="#FBBC05"
            d="M24 46.5c5.5 0 10.41-1.89 14.08-5.11l-7.35-5.69c-2.12 1.5-4.8 2.39-6.73 2.39-4.31 0-8.06-2.61-9.89-6.35l-7.99 6.19C9.21 41.62 16.16 46.5 24 46.5z"
          />
        </svg>
      )}
      {text}
    </Button>
  );
};

export default GoogleSignInButton;

