// src/components/auth/ForgotPassword/ForgotPassword.jsx

import  { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/auth"; // Your Firebase auth instance
import { useAuth } from "../../context/AuthContext"; // To clear auth errors
import AuthLayout from "../layouts/auth/AuthLayout"; // Re-use your auth layout
import AuthForm from "../common/AuthForm"; // Re-use your auth form fields structure
import styles from "./ForgotPassword.module.css"; // Specific CSS for this component

const MESSAGES = {
  RESET_SUCCESS: "If an account with that email exists, a password reset link has been sent to it.",
  RESET_ERROR: "Failed to send password reset email. Please try again.",
  NO_EMAIL: "Please enter your email address.",
  INVALID_EMAIL: "Please enter a valid email address.",
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null); // Local error message for this component

  // We can use clearAuthError from AuthContext if we want to clear global auth errors
  const { clearAuthError } = useAuth();

  useEffect(() => {
    // Clear any previous error messages when the component mounts
    setErrorMessage(null);
    setSuccessMessage(null);
    clearAuthError(); // Clear any global auth errors as well
  }, [clearAuthError]);

  const validateEmail = (email) => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setErrorMessage(null); // Clear previous error
      setSuccessMessage(null); // Clear previous success

      if (!email) {
        setErrorMessage(MESSAGES.NO_EMAIL);
        setLoading(false);
        return;
      }

      if (!validateEmail(email)) {
        setErrorMessage(MESSAGES.INVALID_EMAIL);
        setLoading(false);
        return;
      }

      try {
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage(MESSAGES.RESET_SUCCESS);
        setEmail(""); // Clear the input field
      } catch (error) {
        console.error("Forgot password error:", error);
        setErrorMessage(error.message || MESSAGES.RESET_ERROR);
      } finally {
        setLoading(false);
      }
    },
    [email] // Dependency: email state
  );

  // Configuration for AuthForm fields
  const fieldsConfig = [
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter your email",
      required: true,
      value: email,
      onChange: (e) => setEmail(e.target.value), // Direct handler for email state
    },
  ];

  return (
    <AuthLayout
      title="Forgot Password?"
      instruction="Enter your email address to receive a password reset link."
      navLinkTo="/signin"
      navLinkLabel="Back to Sign In"
    >
      <form onSubmit={handleSubmit} className={styles.forgotPasswordForm}>
        <AuthForm
          formData={{ email }} // Pass email as formData
          onChange={(e) => setEmail(e.target.value)} // Ensure AuthForm passes correct event object
          submitButtonText={loading ? "Sending..." : "Send Reset Link"}
          disabled={loading}
          fieldsConfig={fieldsConfig}
        />
      </form>

      {successMessage && (
        <p className={styles.successMessage}>{successMessage}</p>
      )}
      {errorMessage && (
        <p className={styles.errorMessage}>{errorMessage}</p>
      )}

      <div className={styles.backToSignIn}>
        <Link to="/signin" className={styles.link}>
          Remember your password? Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};

ForgotPassword.propTypes = {
  // No specific props for this component as it handles its own state
};

export default ForgotPassword;