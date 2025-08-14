import React from "react";
import { Button } from "../../../components/ui/Button";

const AuthToggle = ({ isSignUp, onToggle }) => {
  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-2">
        {isSignUp
          ? "Already have an account?"
          : "Don't have an account yet?"}
      </p>
      <Button
        type="button"
        variant="link"
        onClick={onToggle}
        className="text-primary hover:text-accent"
      >
        {isSignUp ? "Sign In" : "Create Account"}
      </Button>
    </div>
  );
};

export default AuthToggle;



