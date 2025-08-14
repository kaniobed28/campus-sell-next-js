import React, { useState } from "react";
import { FormField } from "../../../components/ui/FormField";
import { Button } from "../../../components/ui/Button";

const AuthForm = ({ isSignUp, onSubmit, error, loading = false }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        error={error && error.includes('email') ? error : undefined}
      />
      
      <FormField
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        helperText={isSignUp ? "Password should be at least 6 characters" : undefined}
        error={error && error.includes('password') ? error : undefined}
      />
      
      {error && !error.includes('email') && !error.includes('password') && (
        <div className="text-destructive text-sm p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}
      
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
        disabled={loading}
      >
        {isSignUp ? "Create Account" : "Sign In"}
      </Button>
    </form>
  );
};

export default AuthForm;




