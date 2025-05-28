// src/components/auth/SignIn.jsx
import React, { useEffect } from "react";
import { getAllProviders } from "../../data/externalAuthProviderConfig";
import { signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import AuthForm from "../common/AuthForm";
import useSignIn from "../../hooks/useSignIn";
import SocialAuthButtons from "../common/SocialAuthButton";
import { auth } from "../../firebase/auth";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../layouts/auth/AuthLayout";
import styles from "./SignIn.module.css"; // Use CSS Modules

const SignIn = () => {
  const navigate = useNavigate();
  const { user, setError: setAuthContextError } = useAuth(); // Renamed to avoid conflict
  const externalProviders = getAllProviders();
  const { formData, error: signInError, isSubmitting, handleChange, handleSubmit } =
    useSignIn(); // Renamed error to signInError

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/student/dashboard");
    }
  }, [user, navigate]);

  const handleExternalSignIn = (providerName) => {
    const providerConfig = externalProviders.find(
      (p) => p.name.toLowerCase() === providerName.toLowerCase()
    );
    if (!providerConfig) {
      setAuthContextError(`Sign-in with ${providerName} is not configured.`);
      return;
    }

    if (providerConfig.signInMethod === "signInWithPopup") {
      signInWithPopup(auth, providerConfig.provider)
        .then(() => {
          // AuthContext handles the state update and navigation
        })
        .catch((err) => {
          // Display a user-friendly error message
          setAuthContextError(err.message || `Failed to sign in with ${providerName}. Please try again.`);
        });
    } else if (providerConfig.signInMethod === "initiateLinkedInLogin") {
      console.log("LinkedIn login initiated. Implement your LinkedIn specific flow here.");
      // Example: initiateLinkedInLogin(); // Call your actual LinkedIn function
    } else {
      setAuthContextError(`Unsupported sign-in method for ${providerName}.`);
    }
  };

  const fieldsConfig = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email", // More descriptive placeholder
      required: true,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password", // More descriptive placeholder
      required: true,
    },
  ];

  return (
    <AuthLayout
      title="Welcome Back!" // Slightly more engaging title
      instruction="Log in to Zeelevate Academy to continue your learning journey." // More descriptive instruction
    >
      {/* Form for email/password sign-in */}
      <form onSubmit={handleSubmit} className={styles.signInForm}> {/* Apply form style */}
        <AuthForm
          formData={formData}
          onChange={handleChange}
          submitButtonText="Login to My Account" // Clearer button text
          disabled={isSubmitting}
          fieldsConfig={fieldsConfig}
        />
      </form>

      {/* Display errors if any */}
      {(signInError || user?.error) && ( // Show error from useSignIn or AuthContext
        <p className={styles.errorMessage}>{signInError || user?.error}</p>
      )}

      {/* Forgot Password Link */}
      <div className={styles.forgotPassword}>
        <Link to="/reset-password" className={styles.link}>
          Forgot Password?
        </Link>
      </div>

      {/* Divider */}
      <div className={styles.divider}>
        <span className={styles.dividerText}>OR</span>
      </div>

      {/* Social Sign-in Buttons */}
      <div className={styles.socialAuthSection}> {/* New container for clarity */}
        <SocialAuthButtons
          providers={externalProviders}
          onSignIn={handleExternalSignIn}
        />
      </div>

      {/* Sign Up Link */}
      <div className={styles.signUp}>
        <p>
          Don't have an account?{" "}
          <Link to="/signup" className={`${styles.link} ${styles.primaryLink}`}>
            Sign Up Now
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignIn;