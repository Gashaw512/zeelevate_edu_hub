// src/components/auth/SignIn.jsx
import { useEffect } from "react";
import { getAllProviders } from "../../data/externalAuthProviderConfig";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import AuthForm from "../common/AuthForm";
import useSignIn from "../../hooks/useSignIn";
import SocialAuthButtons from "../common/SocialAuthButton";
import { auth } from "../../firebase/auth";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../layouts/auth/AuthLayout";
import "./SignIn.css";

const SignIn = () => {
  const navigate = useNavigate();
  const { user, setError } = useAuth();
  const externalProviders = getAllProviders();
  const { formData, error, isSubmitting, handleChange, handleSubmit } =
    useSignIn();

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
      setError(`Sign-in with ${providerName} is not configured.`);
      return;
    }

    if (providerConfig.signInMethod === "signInWithPopup") {
      signInWithPopup(auth, providerConfig.provider)
        .then(() => {
          // AuthContext handles the state update and navigation
        })
        .catch((err) => {
          setError(err.message || `Failed to sign in with ${providerName}.`);
        });
    } else if (providerConfig.signInMethod === "initiateLinkedInLogin") {
      console.log("Call this function: initiateLinkedInLogin()");
      // initiateLinkedInLogin();
    } else {
      setError(`Unsupported sign-in method for ${providerName}.`);
    }
  };

  const fieldsConfig = [
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Email",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Password",
      required: true,
    },
  ];

  return (
    <AuthLayout
      title="Welcome"
      instruction="Login to Zeelevate Academy to continue your learning journey"
    >
      {/* Move form wrapper here to avoid nested form error */}
      <form onSubmit={handleSubmit}>
        <AuthForm
          formData={formData}
          onChange={handleChange}
          submitButtonText="Login"
          disabled={isSubmitting}
          fieldsConfig={fieldsConfig}
        />
      </form>

      {error && <p className="error-message">{error}</p>}

      <div className="forgot-password">
        <a href="/reset-password" className="link">
          Forgot Password?
        </a>
      </div>

      <div className="sign-up">
        <p>
          Do not have an account?{" "}
          <a href="/signup" className="link primary-link">
            Sign Up
          </a>
        </p>
      </div>

      <div className="divider">
        <span className="divider-text">OR</span>
      </div>

      <SocialAuthButtons
        providers={externalProviders}
        onSignIn={handleExternalSignIn}
      />
    </AuthLayout>
  );
};

export default SignIn;
