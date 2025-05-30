import { useState, useCallback, useEffect, useRef } from 'react';

const useFormValidation = (formData, fieldsConfig) => {
    const [fieldErrors, setFieldErrors] = useState({});
    const [isValid, setIsValid] = useState(false);
    const touchedFields = useRef({});
    const isInitialRender = useRef(true);

    const validate = useCallback(() => {
        let errors = {};
        let formIsValid = true;

        // Required field validation
        fieldsConfig.forEach(field => {
            if (field.required && !formData[field.name]?.trim()) {
                errors[field.name] = `${field.label} is required.`;
                formIsValid = false;
            }
        });

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format.';
            formIsValid = false;
        }

        // Password validation
        if (formData.password) {
            if (formData.password.length < 6) {
                errors.password = 'Password must be at least 6 characters.';
                formIsValid = false;
            }
            if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match.';
                formIsValid = false;
            }
        }

        // Update state only if changes exist
        if (JSON.stringify(fieldErrors) !== JSON.stringify(errors)) {
            setFieldErrors(errors);
        }
        if (isValid !== formIsValid) {
            setIsValid(formIsValid);
        }

        return formIsValid;
    }, [formData, fieldsConfig, fieldErrors, isValid]);

    // Validation effect
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }

        const timer = setTimeout(validate, 300);
        return () => clearTimeout(timer);
    }, [formData, validate]);

    const handleFieldChange = useCallback((e) => {
        const { name } = e.target;
        touchedFields.current[name] = true;
    }, []);

    const resetValidation = useCallback(() => {
        setFieldErrors({});
        setIsValid(false);
        touchedFields.current = {};
    }, []);

    return {
        fieldErrors,
        isValid, 
        validate,
        handleFieldChange,
        resetValidation
    };
};

export default useFormValidation;