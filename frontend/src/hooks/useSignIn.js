// src/hooks/useSignIn.js
import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const useSignIn = () => {
  const { login, authError } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await login(formData.email, formData.password);
      } catch {
        // authError is handled globally in AuthContext
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData.email, formData.password, login]
  );

  return {
    formData,
    authError,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
};

export default useSignIn;
