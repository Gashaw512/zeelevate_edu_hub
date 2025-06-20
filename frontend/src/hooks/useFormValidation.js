import { useState, useCallback, useEffect, useRef } from 'react';
import { isValidPhoneNumber } from 'libphonenumber-js'; // Ensure this is installed: npm install libphonenumber-js

/**
 * Custom React hook for configurable form validation.
 * Manages form errors, touched states, and overall form validity.
 *
 * @param {Object} formData - Current form data (key-value pairs).
 * @param {Array<Object>} fieldsConfig - Array of field validation rules.
 * Each field config object supports:
 * - `name`: (string) Field name (matches formData key).
 * - `label`: (string) User-friendly label for error messages.
 * - `required`: (boolean) If true, field cannot be empty.
 * - `type`: (string) 'email' or 'name' for built-in rules.
 * - `minLength`, `maxLength`: (number) String length constraints.
 * - `min`, `max`: (number) Numeric value constraints.
 * - `regex`: (RegExp) Custom regex test.
 * - `matches`: (string) Name of another field to match (e.g., 'passwordConfirm').
 * - `validator`: (function) Custom `(value, formData) => string | null` function
 * returning an error message or null. Ideal for complex rules like phone validation.
 * - `errorMessage`: (string) Custom error message for a specific rule.
 */
const useFormValidation = (formData, fieldsConfig) => {
    const [allFieldErrors, setAllFieldErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    const isInitialRender = useRef(true);

    /**
     * Core validation logic: applies all rules from `fieldsConfig`.
     * @returns {boolean} True if the entire form is currently valid.
     */
    const validateForm = useCallback(() => {
        let errors = {};
        let formIsValid = true;

        fieldsConfig.forEach(field => {
            const value = formData[field.name];
            let fieldError = null;

            // Check for required fields
            if (field.required && (value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0))) {
                fieldError = field.errorMessage || `${field.label} is required.`;
            }

            // Proceed with other validations only if no 'required' error
            if (!fieldError) {
                // Type-specific validations (email, name)
                if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    fieldError = field.errorMessage || 'Invalid email format.';
                } else if (field.type === 'name' && value) {
                    const nameRegex = field.regex || /^[a-zA-Z\s'-]+$/;
                    if (!nameRegex.test(value)) {
                        fieldError = field.errorMessage || `${field.label} must contain only letters, spaces, hyphens, or apostrophes.`;
                    }
                }

                // Min/Max Length for strings
                if (typeof value === 'string' && value) {
                    if (field.minLength && value.length < field.minLength) {
                        fieldError = field.errorMessage || `${field.label} must be at least ${field.minLength} characters.`;
                    }
                    if (!fieldError && field.maxLength && value.length > field.maxLength) {
                        fieldError = field.errorMessage || `${field.label} cannot exceed ${field.maxLength} characters.`;
                    }
                }

                // Min/Max Numeric validation
                if (typeof value === 'number' && !isNaN(value)) {
                    if (field.min !== undefined && value < field.min) {
                        fieldError = field.errorMessage || `${field.label} must be at least ${field.min}.`;
                    }
                    if (!fieldError && field.max !== undefined && value > field.max) {
                        fieldError = field.errorMessage || `${field.label} cannot exceed ${field.max}.`;
                    }
                }

                // General Regex validation (if not already handled by type-specific regex)
                if (!fieldError && field.regex && value && !field.regex.test(value)) {
                    const isHandledByType = (field.type === 'email' || field.type === 'name');
                    if (!isHandledByType) {
                        fieldError = field.errorMessage || `${field.label} is not in a valid format.`;
                    }
                }

                // 'Matches' other field validation
                if (!fieldError && field.matches && value !== formData[field.matches]) {
                    const matchedFieldLabel = fieldsConfig.find(f => f.name === field.matches)?.label || field.matches;
                    fieldError = field.errorMessage || `${field.label} does not match ${matchedFieldLabel}.`;
                }

                // Custom validator function (e.g., for international phone numbers)
                if (!fieldError && field.validator && value !== undefined) {
                    const customError = field.validator(value, formData);
                    if (customError) {
                        fieldError = customError;
                    }
                }
            }

            if (fieldError) {
                errors[field.name] = fieldError;
                formIsValid = false;
            }
        });

        setAllFieldErrors(errors);
        setIsFormValid(formIsValid);
        return formIsValid;
    }, [formData, fieldsConfig]);

    // Debounced validation on formData or fieldsConfig changes
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }

        const handler = setTimeout(() => {
            validateForm();
        }, 300); // Debounce delay

        return () => clearTimeout(handler);
    }, [formData, fieldsConfig, validateForm]);

    /**
     * Marks a field as touched on change, enabling conditional error display.
     * @param {Event} e - Input change event.
     */
    const handleFieldChange = useCallback((e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({ ...prev, [name]: true }));
    }, []);

    /**
     * Marks a field as touched and re-validates on blur, providing immediate feedback.
     * @param {Event} e - Input blur event.
     */
    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({ ...prev, [name]: true }));
        validateForm();
    }, [validateForm]);

    /**
     * Resets all validation errors and touched states.
     */
    const resetValidation = useCallback(() => {
        setAllFieldErrors({});
        setTouchedFields({});
        setIsFormValid(false);
        isInitialRender.current = true;
    }, []);

    /**
     * Returns errors only for fields that have been touched, for user-facing display.
     */
    const displayedErrors = Object.keys(allFieldErrors).reduce((acc, fieldName) => {
        if (touchedFields[fieldName]) {
            acc[fieldName] = allFieldErrors[fieldName];
        }
        return acc;
    }, {});

    return {
        fieldErrors: displayedErrors, // Errors for touched fields
        isValid: isFormValid,         // Overall form validity
        validate: validateForm,       // Function to force validation (e.g., on submit)
        handleFieldChange,            // onChange handler for inputs
        handleBlur,                   // onBlur handler for inputs
        resetValidation,              // Resets validation state
        allErrors: allFieldErrors     // All validation errors (touched or not)
    };
};

export default useFormValidation;
