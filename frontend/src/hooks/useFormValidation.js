// hooks/useFormValidation.js
import { useState, useCallback, useEffect, useRef } from 'react';

const useFormValidation = (formData, fieldsConfig) => {
    const [fieldErrors, setFieldErrors] = useState({});
    const [isValid, setIsValid] = useState(false);

    const touchedFields = useRef({});

    const validate = useCallback(() => {
        let errors = {};
        let currentFormIsValid = true;

        fieldsConfig.forEach(field => {
            if (field.required && !formData[field.name]) {
                errors[field.name] = `${field.label} is required.`;
                currentFormIsValid = false;
            }
        });

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format.';
            currentFormIsValid = false;
        }

        // For sign-in, we usually don't need password length/confirm password validation here.
        // It's mostly about presence if required. If you want password minimum length for sign-in, keep it.
        // For general use, I'll keep the password rules, but SignIn's `fieldsConfig` might not need `confirmPassword`.
        if (formData.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters.';
            currentFormIsValid = false;
        }

        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match.';
            currentFormIsValid = false;
        }

        // Filter errors to only show for touched fields or during explicit validation.
        // For a general hook, simply return all detected errors. The component decides how to display.
        const newFieldErrors = {};
        for (const fieldName in errors) {
            newFieldErrors[fieldName] = errors[fieldName];
        }

        // Only update if they are actually different to prevent unnecessary renders
        if (JSON.stringify(fieldErrors) !== JSON.stringify(newFieldErrors)) {
            setFieldErrors(newFieldErrors);
        }
        if (isValid !== currentFormIsValid) {
            setIsValid(currentFormIsValid);
        }

        return currentFormIsValid;
    }, [formData, fieldsConfig, fieldErrors, isValid]);

    useEffect(() => {
        const isInitialEmptyRender = Object.values(formData).every(val => val === '') && Object.keys(touchedFields.current).length === 0;

        if (isInitialEmptyRender) {
            if (Object.keys(fieldErrors).length > 0 || isValid) {
                setFieldErrors({});
                setIsValid(false);
            }
            return;
        }

        const handler = setTimeout(() => {
            const shouldRunValidation = Object.keys(touchedFields.current).length > 0 || Object.keys(fieldErrors).length > 0;
            if (shouldRunValidation) {
                 validate();
            }
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [formData, validate, fieldErrors, isValid]);

    const handleFieldChange = useCallback((e) => {
        const { name } = e.target;
        touchedFields.current = { ...touchedFields.current, [name]: true };
    }, []);

    // Function to explicitly reset all validation states and touched fields
    const resetValidation = useCallback(() => {
        setFieldErrors({});
        setIsValid(false);
        touchedFields.current = {};
    }, []);


    return {
        fieldErrors,
        isValid,
        validate,
        setFieldErrors,
        handleFieldChange,
        resetValidation // Added this for convenience
    };
};

export default useFormValidation;