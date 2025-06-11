import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import useSignIn from "../../../hooks/useSignIn";
import AuthLayout from "../../layouts/auth/AuthLayout";
import AuthForm from "../../common/AuthForm";
import styles from "./SignIn.module.css";

const SignIn = () => {
  const navigate = useNavigate();
  // Destructure authError and clearAuthError from useAuth
  const { user, authError, clearAuthError } = useAuth();
  const { formData, error: localSignInError, isSubmitting, handleChange, handleSubmit } = useSignIn(); 
  const SESSION_TIMEOUT = 20 * 60 * 1000; // 30 minutes in milliseconds


  useEffect(() => {
      if (user) {
      // Clear any auth errors when user logs in successfully
      console.log(user.accessToken)
          const tokenExpiry = new Date().getTime() + SESSION_TIMEOUT;
         localStorage.setItem('tokenExpiry', tokenExpiry.toString());
          localStorage.setItem('token', user.accessToken); // Store token in localStorage

      clearAuthError();
      if (user.role === "student") {
        navigate("/student/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      }
    }
  }, [user, navigate, clearAuthError]); // Add clearAuthError to dependencies

  // Clear auth error when component mounts or error changes (e.g., trying again)
  useEffect(() => {
    // You might want to clear authError when the form is interacted with,
    // or just let the handleSubmit function clear it.
    // For now, it's cleared before a new submission.
    // If you want to clear it when the user types, add a dependency to formData.
  }, []);

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

    </AuthLayout>
  );
};

export default SignIn;