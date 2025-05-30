// src/hooks/useSignIn.js
import { useState } from 'react';
import { emailPasswordSignIn } from '../utils/authService'; // Assuming this is where your Firebase sign-in logic lives
import { useAuth } from '../context/AuthContext';

const useSignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState(''); // Renamed to localError to avoid confusion
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setAuthError, login } = useAuth(); // Destructure setAuthError and login from AuthContext

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(''); // Clear local error
    setAuthError(null); // Clear auth context error (set to null, not empty string)
    setIsSubmitting(true);

    try {
      // Use the 'login' function from AuthContext directly
      await login(formData.email, formData.password);
      // If login is successful, onAuthStateChanged in AuthContext will update the user state.
      // No need to check for 'success' from emailPasswordSignIn if 'login' handles it internally.
      // If `login` throws an error, it will be caught below.
    } catch (err) {
      // The `login` function in AuthContext already sets a user-friendly error message
      // for common Firebase errors. You might want to display that or a more general one here.
      // If `login` doesn't throw, then `setAuthError` in `AuthContext` was called.
      // If it *does* throw, you might catch it here and set a local error.
      // For simplicity, let's rely on AuthContext to manage the authError.
      console.error('Sign-in attempt failed:', err);
      // No need to set setLocalError here if AuthContext handles it.
      // The SignIn component should display the authError from AuthContext.
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    error: localError, // Return localError for form-specific validation, if any
    isSubmitting,
    handleChange,
    handleSubmit
  };
};

export default useSignIn;