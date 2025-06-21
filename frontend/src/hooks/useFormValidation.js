// src/hooks/useFormValidation.js
import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Validates a form based on field configuration rules.
 *
 * @param {Object} formData - Current form field values.
 * @param {Array<Object>} fieldsConfig - Rules for each field.
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
        errorMessage,
      } = field;

      const rawValue = formData[name];
      const value =
        typeof rawValue === 'string' ? rawValue.trim() : rawValue;

      let error = null;

      // === Required Field ===
      const isEmpty =
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value === '') ||
        (Array.isArray(value) && value.length === 0);

      if (required && isEmpty) {
        error = errorMessage || `${label} is required.`;
      }

      // === Type: Email ===
      if (!error && type === 'email' && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          error = errorMessage || 'Please enter a valid email address.';
        }
      }

      // === Type: Name ===
      if (!error && type === 'name' && value) {
        const nameRegex = regex || /^[a-zA-Z\s'-]+$/;
        if (!nameRegex.test(value)) {
          error = errorMessage || `${label} must contain only letters and valid characters.`;
        }
      }

      // === String length check ===
      if (!error && typeof value === 'string') {
        if (minLength && value.length < minLength) {
          error = errorMessage || `${label} must be at least ${minLength} characters.`;
        } else if (maxLength && value.length > maxLength) {
          error = errorMessage || `${label} must be no more than ${maxLength} characters.`;
        }
      }

      // === Numeric min/max ===
      if (!error && typeof value === 'number' && !isNaN(value)) {
        if (min !== undefined && value < min) {
          error = errorMessage || `${label} must be at least ${min}.`;
        } else if (max !== undefined && value > max) {
          error = errorMessage || `${label} must be no more than ${max}.`;
        }
      }

      // === Regex (custom formats like phone) ===
      if (!error && regex && value && !regex.test(value)) {
        error = errorMessage || `${label} format is invalid.`;
      }

      // === Match another field ===
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

  // Debounced auto-validation
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      validateForm();
    }, 300); // debounce delay

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

  // Only show errors for touched fields
  const displayedErrors = Object.keys(fieldErrors).reduce((acc, key) => {
    if (touchedFields[key]) {
      acc[key] = fieldErrors[key];
    }
    return acc;
  }, {});

  return {
    fieldErrors: displayedErrors,   // visible errors (touched fields only)
    allErrors: fieldErrors,         // all errors (useful on submission)
    isValid,                        // entire form validity
    validate: validateForm,         // manual trigger
    handleFieldChange,              // to be passed to input `onChange`
    handleBlur,                     // to be passed to input `onBlur`
    resetValidation                 // reset state
  };
};

export default useFormValidation;
