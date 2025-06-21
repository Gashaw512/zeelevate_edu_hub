// src/hooks/useSignIn.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const useSignIn = () => {
  const { login, authError } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
    } catch {
      // Error handled by AuthContext - no local error set here
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    authError,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
};

export default useSignIn;
