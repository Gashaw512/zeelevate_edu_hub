import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth } from "../../../firebase/auth";
import { useAuth } from "../../../context/AuthContext";
import { getAllProviders } from "../../../data/externalAuthProviderConfig";
import useSignIn from "../../../hooks/useSignIn";
import AuthLayout from "../../layouts/auth/AuthLayout";
import AuthForm from "../../common/AuthForm";
import SocialAuthButtons from "../../common/SocialAuthButton";
import styles from "./SignIn.module.css";

const SignIn = () => {
  const navigate = useNavigate();
  // Destructure authError and clearAuthError from useAuth
  const { user, authError, clearAuthError } = useAuth();
  const { formData, error: localSignInError, isSubmitting, handleChange, handleSubmit } = useSignIn(); // Renamed error to localSignInError
  const externalProviders = getAllProviders();

  useEffect(() => {
      if (user) {
      // Clear any auth errors when user logs in successfully
      console.log(user)
      clearAuthError();
      navigate("/student/dashboard");
    }
  }, [user, navigate, clearAuthError]); // Add clearAuthError to dependencies

  // Clear auth error when component mounts or error changes (e.g., trying again)
  useEffect(() => {
    // You might want to clear authError when the form is interacted with,
    // or just let the handleSubmit function clear it.
    // For now, it's cleared before a new submission.
    // If you want to clear it when the user types, add a dependency to formData.
  }, []);

  const handleExternalSignIn = (providerName) => {
    clearAuthError(); // Clear any previous errors
    const providerConfig = externalProviders.find(
      p => p.name.toLowerCase() === providerName.toLowerCase()
    );

    if (!providerConfig) {
      setAuthError(`${providerName} sign-in is not configured`); // Use setAuthError from context
      return;
    }

    switch (providerConfig.signInMethod) {
      case "signInWithPopup":
        signInWithPopup(auth, providerConfig.provider)
          .catch(err => {
            // Set the error directly in the AuthContext
            // Make sure to access setAuthError from useAuth hook
            // In your SignIn component, you're destructuring it as `setAuthContextError`
            // So, make sure setAuthContextError is provided by useAuth.
            // Revert to using `setAuthError` as defined in AuthContext.jsx
            setAuthError(err.message || `Failed to sign in with ${providerName}`);
          });
        break;

      case "initiateLinkedInLogin":
        console.log("Implement LinkedIn login flow");
        // You might want to set an error here as well if LinkedIn isn't implemented
        setAuthError("LinkedIn login is not yet implemented.");
        break;

      default:
        setAuthError(`Unsupported method for ${providerName}`);
    }
  };

  const fieldsConfig = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
      required: true
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password",
      required: true
    }
  ];

  return (
    <AuthLayout
      title="Welcome Back!" // Specific title for Sign In
      instruction="Please sign in to access your account." // Specific instruction
      navLinkTo="/signup" // Optional: Link to Sign Up
      navLinkLabel="Create an Account" // Label for the Sign Up link
    >
      <form onSubmit={handleSubmit} className={styles.signInForm}>
        <AuthForm
          formData={formData}
          onChange={handleChange}
          submitButtonText="Login to My Account"
          disabled={isSubmitting}
          fieldsConfig={fieldsConfig}
        />
      </form>

      {/* Display errors from useSignIn (local form validation) or AuthContext (auth-specific) */}
      {(localSignInError || authError) && (
        <p className={styles.errorMessage}>{localSignInError || authError}</p>
      )}

      <div className={styles.forgotPassword}>
        <Link to="/reset-password" className={styles.link}>
          Forgot Password?
        </Link>
      </div>

      <div className={styles.divider}>
        <span className={styles.dividerText}>OR</span>
      </div>

      <div className={styles.socialAuthSection}>
        <SocialAuthButtons
          providers={externalProviders}
          onSignIn={handleExternalSignIn}
        />
      </div>

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