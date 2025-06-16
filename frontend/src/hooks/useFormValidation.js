import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * A custom React hook for robust and configurable form validation.
 * It provides real-time validation feedback, handles debouncing,
 * and allows for custom validation rules.
 *
 * @param {Object} formData - The current state of the form data (key-value pairs).
 * @param {Array<Object>} fieldsConfig - An array of objects, each defining a field's validation rules.
 * Each field config object can have:
 * - `name`: (string) The name of the form field (must match key in formData).
 * - `label`: (string) A user-friendly label for the field (used in default error messages).
 * - `required`: (boolean, optional) If true, the field cannot be empty.
 * - `type`: (string, optional) Specific types like 'email' or 'name' for built-in validation.
 * - `minLength`: (number, optional) Minimum length for string values.
 * - `maxLength`: (number, optional) Maximum length for string values.
 * - `min`: (number, optional) Minimum numeric value.
 * - `max`: (number, optional) Maximum numeric value.
 * - `regex`: (RegExp, optional) A regular expression to test the value against.
 * - `matches`: (string, optional) The `name` of another field whose value this field must match.
 * - `validator`: (function, optional) A custom function `(value, formData) => string | null`.
 * It should return an error message string if invalid, or `null` if valid.
 * - `errorMessage`: (string, optional) A custom error message for the rule.
 */
const useFormValidation = (formData, fieldsConfig) => {
    // State to store all validation errors, regardless of whether a field is touched.
    const [allFieldErrors, setAllFieldErrors] = useState({});
    // State to track which fields have been "touched" (edited or blurred).
    const [touchedFields, setTouchedFields] = useState({});
    // State to indicate if the entire form is valid based on `allFieldErrors`.
    const [isFormValid, setIsFormValid] = useState(false);

    // Ref to prevent validation on the initial render when formData is first set.
    const isInitialRender = useRef(true);

    /**
     * The core validation logic. It iterates through the fieldsConfig
     * and applies all defined validation rules.
     * @returns {Object} An object containing error messages for invalid fields.
     */
    const validateForm = useCallback(() => {
        let errors = {};
        let formIsValid = true;

        fieldsConfig.forEach(field => {
            const value = formData[field.name];
            let fieldError = null; // Error message for the current field

            // 1. Required field validation
            if (field.required && (!value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0))) {
                fieldError = field.errorMessage || `${field.label} is required.`;
            }

            // If an error is already found, skip further validations for this field (unless it's a custom validator that should run always)
            if (!fieldError) {
                // 2. Type-specific validation (e.g., email, name)
                if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    fieldError = field.errorMessage || 'Invalid email format.';
                } else if (field.type === 'name' && value) {
                    // Default regex for names: allows letters, spaces, hyphens, and apostrophes
                    // This is applied if no specific regex is provided for a name field
                    const nameRegex = field.regex || /^[a-zA-Z\s'-]+$/;
                    if (!nameRegex.test(value)) {
                        fieldError = field.errorMessage || `${field.label} must contain only letters, spaces, hyphens, or apostrophes.`;
                    }
                }

                // 3. Min/Max Length validation for strings
                if (typeof value === 'string' && value) {
                    if (field.minLength && value.length < field.minLength) {
                        fieldError = field.errorMessage || `${field.label} must be at least ${field.minLength} characters.`;
                    }
                    if (!fieldError && field.maxLength && value.length > field.maxLength) {
                        fieldError = field.errorMessage || `${field.label} cannot exceed ${field.maxLength} characters.`;
                    }
                }

                // 4. Min/Max Numeric validation
                if (typeof value === 'number' && !isNaN(value)) {
                    if (field.min !== undefined && value < field.min) {
                        fieldError = field.errorMessage || `${field.label} must be at least ${field.min}.`;
                    }
                    if (!fieldError && field.max !== undefined && value > field.max) {
                        fieldError = field.errorMessage || `${field.label} cannot exceed ${field.max}.`;
                    }
                }

                // 5. Regex validation (applied after type-specific regex if both exist, but type-specific might override if needed)
                // Note: The order here ensures that if type 'name' has a default regex and field.regex is provided,
                // field.regex would be checked here. However, the current logic for type 'name' already
                // uses 'field.regex || /^[a-zA-Z\s'-]+$/', so this general
                // regex check will only apply if type is NOT 'name' or 'email' and a regex is directly provided.
                if (!fieldError && field.regex && value && !field.regex.test(value)) {
                    const isHandledByType = (field.type === 'email' || field.type === 'name');
                    if (!isHandledByType) { // Only apply if it wasn't already handled by a specific type
                        fieldError = field.errorMessage || `${field.label} is not in a valid format.`;
                    }
                }


                // 6. 'Matches' another field validation (e.g., confirm password)
                if (!fieldError && field.matches && value !== formData[field.matches]) {
                    const matchedFieldLabel = fieldsConfig.find(f => f.name === field.matches)?.label || field.matches;
                    fieldError = field.errorMessage || `${field.label} does not match ${matchedFieldLabel}.`;
                }

                // 7. Custom validator function
                if (!fieldError && field.validator && value !== undefined) { // Run custom validator if no prior errors and value exists
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

        // Update global error state and overall form validity
        setAllFieldErrors(errors);
        setIsFormValid(formIsValid);

        return formIsValid; // Return validity for immediate use (e.g., form submission)
    }, [formData, fieldsConfig]);

    // Effect to debounce validation on formData changes.
    // It runs after an initial render skip, and then whenever formData or fieldsConfig changes.
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }

        const handler = setTimeout(() => {
            validateForm(); // Debounced call to validate the form
        }, 300); // Debounce delay

        return () => {
            clearTimeout(handler); // Cleanup on unmount or re-render
        };
    }, [formData, fieldsConfig, validateForm]);

    /**
     * Marks a field as touched when its value changes.
     * This helps in deciding when to display errors (e.g., only for touched fields).
     * @param {Event} e - The change event from an input element.
     */
    const handleFieldChange = useCallback((e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({ ...prev, [name]: true }));
    }, []);

    /**
     * Marks a field as touched and triggers immediate validation when it loses focus.
     * This provides immediate feedback as users move between fields.
     * @param {Event} e - The blur event from an input element.
     */
    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({ ...prev, [name]: true }));
        validateForm(); // Re-validate immediately on blur
    }, [validateForm]);

    /**
     * Resets all validation errors and touched states, making the form appear clean.
     */
    const resetValidation = useCallback(() => {
        setAllFieldErrors({});
        setTouchedFields({});
        setIsFormValid(false);
        isInitialRender.current = true; // Reset initial render flag if needed for a full form reset scenario
    }, []);

    /**
     * Filters all validation errors to only show those for fields that have been touched.
     * This is the object applications should use to display errors to the user.
     */
    const displayedErrors = Object.keys(allFieldErrors).reduce((acc, fieldName) => {
        if (touchedFields[fieldName]) {
            acc[fieldName] = allFieldErrors[fieldName];
        }
        return acc;
    }, {});

    return {
        // Errors specifically for fields that have been touched.
        fieldErrors: displayedErrors,
        // Overall validity of the entire form (all fields, touched or not).
        isValid: isFormValid,
        // Function to trigger full form validation explicitly (e.g., on form submission).
        validate: validateForm,
        // Event handler for input `onChange` to mark fields as touched.
        handleFieldChange,
        // Event handler for input `onBlur` to mark fields as touched and validate.
        handleBlur,
        // Function to reset all validation states.
        resetValidation,
        // Expose all errors (useful for debugging or showing all errors on submit)
        allErrors: allFieldErrors
    };
};

export default useFormValidation;
