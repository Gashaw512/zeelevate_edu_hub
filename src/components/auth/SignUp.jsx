import { signInWithPopup } from "firebase/auth";
import { useSearchParams } from "react-router-dom";
import { auth } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";
import AuthForm from "../common/AuthForm";
import AuthLayout from "../layouts/auth/AuthLayout";
import SocialAuthButtons from "../common/SocialAuthButton";
import useSignUp from "../../hooks/useSignUp";
import { getAllProviders } from "../../data/externalAuthProviderConfig";
import "./SignUp.css";

const SignUp = () => {
  const navigate = useNavigate();
  const externalProviders = getAllProviders();
  const {
    formData,
    error,
    isSubmitting,
    handleChange,
    handleEmailPasswordSignUp,
    handleGoogleSignUp,
    initiateLinkedInSignUp,
    handleLinkedInCallbackSignUp,
    setError, // Add setError here
  } = useSignUp();

  // Automatically handle LinkedIn callback if code param exists
  // useEffect(() => {
  //   handleLinkedInCallbackSignUp();
  // }, [handleLinkedInCallbackSignUp]);

  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const handleExternalSignUp = (providerName) => {
    setError("");
    const providerConfig = externalProviders.find(
      (p) => p.name.toLowerCase() === providerName.toLowerCase()
    );
    if (!providerConfig) {
      setError(`Sign-up with ${providerName} is not configured.`);
      return;
    }

    if (
      providerConfig.signInMethod === "signInWithPopup" &&
      providerConfig.provider
    ) {
      if (providerName.toLowerCase() === "google") {
        handleGoogleSignUp();
      } else {
        signInWithPopup(auth, providerConfig.provider)
          .then(() => {
            navigate("/student/dashboard"); // Adjust navigation as needed
          })
          .catch((err) => {
            setError(err.message || `Failed to sign up with ${providerName}.`);
          });
      }
    } else if (providerConfig.signInMethod === "initiateLinkedInLogin") {
      initiateLinkedInSignUp(); // Call the function to redirect to LinkedIn
    } else {
      setError(`Unsupported sign-up method for ${providerName}.`);
    }
  };

  return (
    <AuthLayout
      title="Create an Account"
      instruction="Sign up to Zeelevate Academy to start your learning journey"
    >
      <AuthForm
        formData={formData}
        onSubmit={handleEmailPasswordSignUp}
        onChange={handleChange}
        submitButtonText="Sign Up"
        disabled={isSubmitting}
        showConfirmPassword={true} // Make sure your AuthForm handles this prop
        showNameField={true} // Add prop to show name field
      />

      {error && <p className="error-message">{error}</p>}

      <p className="sign-up">
        Already have an account?{" "}
        <a href="/signin" className="link">
          Sign In
        </a>
      </p>

      <div className="divider">
        <span className="divider-text">OR</span>
      </div>
      {code && (
        <button onClick={handleLinkedInCallbackSignUp}>
          Complete LinkedIn Sign-Up
        </button>
      )}

      <SocialAuthButtons
        providers={externalProviders}
        onSignIn={handleExternalSignUp}
      />
    </AuthLayout>
  );
};

export default SignUp;
