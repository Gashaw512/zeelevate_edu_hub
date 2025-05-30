import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { getAllProviders } from "../../data/externalAuthProviderConfig";
import useSignIn from "../../hooks/useSignIn";
import AuthLayout from "../layouts/auth/AuthLayout";
import AuthForm from "../common/AuthForm";
import SocialAuthButtons from "../common/SocialAuthButton";
import styles from "./SignIn.module.css";

const SignIn = () => {
  const navigate = useNavigate();
  const { user, setError: setAuthContextError } = useAuth();
  const { formData, error: signInError, isSubmitting, handleChange, handleSubmit } = useSignIn();
  const externalProviders = getAllProviders();

  useEffect(() => {
    if (user) navigate("/student/dashboard");
  }, [user, navigate]);

  const handleExternalSignIn = (providerName) => {
    const providerConfig = externalProviders.find(
      p => p.name.toLowerCase() === providerName.toLowerCase()
    );

    if (!providerConfig) {
      setAuthContextError(`${providerName} sign-in is not configured`);
      return;
    }

    switch (providerConfig.signInMethod) {
      case "signInWithPopup":
        signInWithPopup(auth, providerConfig.provider)
          .catch(err => {
            setAuthContextError(err.message || `Failed to sign in with ${providerName}`);
          });
        break;
        
      case "initiateLinkedInLogin":
        console.log("Implement LinkedIn login flow");
        break;
        
      default:
        setAuthContextError(`Unsupported method for ${providerName}`);
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
      title="Welcome Back!"
      instruction="Log in to Zeelevate Academy to continue your learning journey"
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

      {(signInError || user?.error) && (
        <p className={styles.errorMessage}>{signInError || user.error}</p>
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