import { useState, useCallback, useEffect } from 'react';


const useContactForm = () => {

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });


  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState({ type: '', text: '' }); 
  const [validationErrors, setValidationErrors] = useState({}); 

  
  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'; 

  useEffect(() => {
    if (responseMessage.text) {
      const timer = setTimeout(() => {
        setResponseMessage({ type: '', text: '' });
      }, 7000); 
      return () => clearTimeout(timer);
    }
  }, [responseMessage]);

 
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
   
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setResponseMessage({ type: '', text: '' }); 
  }, [validationErrors]);

  /**
   * Performs client-side validation for the form.
   * @returns {boolean} 
   */
  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = "Full Name is required.";
    }
    if (!formData.email.trim()) {
      errors.email = "Email Address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.subject.trim()) {
      errors.subject = "Subject is required.";
    }
    if (!formData.message.trim()) {
      errors.message = "Message cannot be empty.";
    }

    setValidationErrors(errors); 
    return Object.keys(errors).length === 0; 
  }, [formData]);

  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setResponseMessage({ type: '', text: '' }); 
    setValidationErrors({}); 

    const isValid = validateForm();
    if (!isValid) {
      setResponseMessage({ type: 'error', text: 'Please correct the highlighted errors.' });
      return; 
    }

    setLoading(true); 

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/contact`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorText = 'Failed to send message. Please try again.';
        try {
          const errorData = await response.json();
          errorText = errorData.message || errorText;
        } catch (jsonError) {
          errorText = response.statusText || `Server error: ${response.status}`;
        }
        throw new Error(errorText);
      }

      setResponseMessage({ type: 'success', text: 'Your message has been sent successfully! We will get back to you shortly.' });
      setFormData({ 
        fullName: "",
        email: "",
        subject: "",
        message: "",
      });

    } catch (error) {
      console.error("Contact form submission error:", error);
      setResponseMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setLoading(false); 
    }
  }, [formData, validateForm, BACKEND_API_URL]);

 
  return {
    formData,
    handleChange,
    handleSubmit,
    loading,
    responseMessage,
    validationErrors,
    setFormData, 
    setResponseMessage 
  };
};

export default useContactForm;
