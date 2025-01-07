import React from "react";

const AuthToggle = ({ isSignUp, onToggle }) => {
  return (
    <p className="mt-4 text-center text-sm">
      {isSignUp
        ? "Already have an account? "
        : "Don't have an account yet? "}
      <button
        type="button"
        className="text-blue-600 hover:underline"
        onClick={onToggle}
      >
        {isSignUp ? "Sign In" : "Sign Up"}
      </button>
    </p>
  );
};

export default AuthToggle;
