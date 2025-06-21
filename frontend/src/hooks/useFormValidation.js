import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Validates a form based on configuration.
 * 
 * @param {Object} formData - Key/value pairs of form fields
 * @param {Array<Object>} fieldsConfig - Configuration array for each field
 */
const useFormValidation = (formData, fieldsConfig) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isValid, setIsValid] = useState(false);

  const isInitialRender = useRef(true);

  const validateForm = useCallback(() => {
    const errors = {};
    let valid = true;

    for (const field of fieldsConfig) {
      const {
        name,
        label = name,
        required,
        type,
        minLength,
        maxLength,
        min,
        max,
        regex,
        matches,
        validator,
        errorMessage
      } = field;

      const value = formData[name];
      let error = null;

      // === Required check ===
      const isEmpty = 
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0);

      if (required && isEmpty) {
        error = errorMessage || `${label} is required.`;
      }

      // === Type-specific validation ===
      if (!error && type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = errorMessage || 'Please enter a valid email address.';
      }

      if (!error && type === 'name' && value) {
        const nameRegex = regex || /^[a-zA-Z\s'-]+$/;
        if (!nameRegex.test(value)) {
          error = errorMessage || `${label} can only contain letters, spaces, apostrophes, or hyphens.`;
        }
      }

      // === String length constraints ===
      if (!error && typeof value === 'string') {
        if (minLength && value.length < minLength) {
          error = errorMessage || `${label} must be at least ${minLength} characters.`;
        }
        if (!error && maxLength && value.length > maxLength) {
          error = errorMessage || `${label} must be no more than ${maxLength} characters.`;
        }
      }

      // === Numeric constraints ===
      if (!error && typeof value === 'number' && !isNaN(value)) {
        if (min !== undefined && value < min) {
          error = errorMessage || `${label} must be at least ${min}.`;
        }
        if (!error && max !== undefined && value > max) {
          error = errorMessage || `${label} must be no more than ${max}.`;
        }
      }

      // === Regex validation ===
      if (!error && regex && type !== 'name' && type !== 'email' && value) {
        if (!regex.test(value)) {
          error = errorMessage || `${label} format is invalid.`;
        }
      }

      // === Matches another field ===
      if (!error && matches && value !== formData[matches]) {
        const matchLabel = fieldsConfig.find(f => f.name === matches)?.label || matches;
        error = errorMessage || `${label} must match ${matchLabel}.`;
      }

      // === Custom validator ===
      if (!error && typeof validator === 'function') {
        const customError = validator(value, formData);
        if (customError) {
          error = customError;
        }
      }

      if (error) {
        errors[name] = error;
        valid = false;
      }
    }

    setFieldErrors(errors);
    setIsValid(valid);
    return valid;
  }, [formData, fieldsConfig]);

  // Debounced validation on input change
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      validateForm();
    }, 300);

    return () => clearTimeout(timeout);
  }, [formData, fieldsConfig, validateForm]);

  const handleFieldChange = useCallback((e) => {
    setTouchedFields(prev => ({ ...prev, [e.target.name]: true }));
  }, []);

  const handleBlur = useCallback((e) => {
    setTouchedFields(prev => ({ ...prev, [e.target.name]: true }));
    validateForm();
  }, [validateForm]);

  const resetValidation = useCallback(() => {
    setFieldErrors({});
    setTouchedFields({});
    setIsValid(false);
    isInitialRender.current = true;
  }, []);

  const displayedErrors = Object.keys(fieldErrors).reduce((acc, key) => {
    if (touchedFields[key]) {
      acc[key] = fieldErrors[key];
    }
    return acc;
  }, {});

  return {
    fieldErrors: displayedErrors,   // Shown errors (for touched fields)
    allErrors: fieldErrors,         // All errors (useful for final form check)
    isValid,                        // Whether the form is valid
    validate: validateForm,         // Manually trigger validation (e.g. on submit)
    handleFieldChange,              // Use in input onChange
    handleBlur,                     // Use in input onBlur
    resetValidation,               // Reset all validation state
  };
};

export default useFormValidation;
