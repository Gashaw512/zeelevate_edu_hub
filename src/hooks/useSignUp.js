import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// IMPORT FIREBASE SDK FUNCTIONS DIRECTLY FROM THE FIREBASE/AUTH PACKAGE
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
} from "firebase/auth";

// IMPORT YOUR CUSTOM FIREBASE AUTH INSTANCE
import { auth } from "../firebase/auth"; // This should export `auth` like: `export const auth = getAuth(app);`
import { db } from "../firebase/firestore"; // Ensure this path is correct for your Firestore instance
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext"; // Ensure this path is correct
import { getProviderConfig } from "../data/externalAuthProviderConfig"; // Ensure this path is correct

const googleProvider = new GoogleAuthProvider();

const useSignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { setError: setGlobalError } = useAuth();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleEmailPasswordSignUp = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setIsSubmitting(true);

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;

        await updateProfile(user, { displayName: formData.name });

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: formData.email,
          name: formData.name,
          role: "student",
        });

        alert("Registration successful");
        navigate("/student/dashboard");
      } catch (err) {
        console.error("Sign-up error:", err);
        let errorMessage = "Failed to create an account.";

        if (err.code === "auth/email-already-in-use") {
          errorMessage = "This email address is already in use.";
        } else if (err.code === "auth/invalid-email") {
          errorMessage = "The email address is not valid.";
        } else if (err.code === "auth/weak-password") {
          errorMessage = "The password is too weak.";
        }

        setError(errorMessage);
        setGlobalError?.(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, navigate, setGlobalError]
  );

  const handleGoogleSignUp = useCallback(async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        role: "student",
      });

      navigate("/student/dashboard");
    } catch (err) {
      console.error("Google sign-up error:", err);
      const message = err.message || "Failed to sign up with Google.";
      setError(message);
      setGlobalError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate, setGlobalError]);

  const initiateLinkedInSignUp = useCallback(() => {
    const linkedInConfig = getProviderConfig("linkedin");

    if (
      !linkedInConfig?.clientId ||
      !linkedInConfig?.redirectUri ||
      !linkedInConfig?.scope
    ) {
      setError("LinkedIn sign-up not properly configured.");
      return;
    }

    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
      linkedInConfig.clientId
    }&redirect_uri=${encodeURIComponent(
      linkedInConfig.redirectUri
    )}&scope=${encodeURIComponent(
      linkedInConfig.scope
    )}&state=random_state_string_signup`;

    window.location.href = linkedInAuthUrl;
  }, []);

  const handleLinkedInCallbackSignUp = useCallback(async () => {
    setError("");
    setIsSubmitting(true);

    const linkedInConfig = getProviderConfig("linkedin");
    if (!linkedInConfig?.backendEndpoint) {
      setError("LinkedIn backend endpoint not configured.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(linkedInConfig.backendEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, flow: "signup" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.message || "Failed to authenticate with LinkedIn"
        );
      }

      const { accessToken } = await response.json();
      const provider = new OAuthProvider("linkedin.com");
      const credential = provider.credential({ accessToken });
      const result = await signInWithCredential(auth, credential);
      const user = result.user;

      const profileResponse = await fetch("/api/auth/linkedin/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: profileData.emailAddress || user.email,

          name:
            profileData.localizedFirstName && profileData.localizedLastName
              ? `${profileData.localizedFirstName} ${profileData.localizedLastName}`
              : user.displayName || "LinkedIn User",

          role: "student",
          linkedinProfileId: profileData.id,
        });
      } else {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "LinkedIn User",
          role: "student",
        });
      }

      navigate("/student/dashboard");
    } catch (err) {
      console.error("LinkedIn sign-up error:", err);
      const message = err.message || "Failed to sign up with LinkedIn.";
      setError(message);
      setGlobalError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, navigate, setGlobalError]);

  return {
    formData,
    error,
    isSubmitting,
    handleChange,
    handleEmailPasswordSignUp,
    handleGoogleSignUp,
    initiateLinkedInSignUp,
    handleLinkedInCallbackSignUp,
    setError,
  };
};

export default useSignUp;
