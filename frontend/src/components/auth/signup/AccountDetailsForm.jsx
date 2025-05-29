// components/forms/AccountDetailsForm/AccountDetailsForm.jsx
import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import AuthForm from '../../common/AuthForm';
import styles from './AccountDetailsForm.module.css';
import useFormValidation from '../../../hooks/useFormValidation'; // Import the custom hook

const AccountDetailsForm = ({ formData, onFormChange, isSubmitting, triggerValidation }) => {
    // Configuration for the fields to be rendered by AuthForm
    const enrollmentFieldsConfig = [
        { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
        { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', required: true },
        { name: 'phoneNumber', 'label': 'Phone Number', type: 'tel', placeholder: 'e.g., +1234567890', required: true },
        { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
        { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', required: true },
    ];

    const [localErrorMessage, setLocalErrorMessage] = useState('');
    // Destructure handleFieldChange from the hook
    const { fieldErrors, isValid, validate, setFieldErrors, handleFieldChange } = useFormValidation(formData, enrollmentFieldsConfig);

    // This useEffect handles when the parent (SignUp) explicitly requests validation
    // via the new `triggerValidation` prop.
    useEffect(() => {
        if (triggerValidation) {
            const currentFormIsValid = validate(); // This call will update fieldErrors and isValid internally
            if (!currentFormIsValid) {
                setLocalErrorMessage('Please correct the highlighted fields to proceed.');
            } else {
                setLocalErrorMessage('');
            }
            // IMPORTANT: Reset triggerValidation immediately after it's acted upon
            // This prevents it from firing repeatedly. SignUp needs to reset it too.
            // (The reset will typically happen in SignUp's handleSubmitAccountDetails).
        }
    }, [triggerValidation, validate]); // Re-run when triggerValidation changes or validate function changes

    // Effect to clear local error message if form becomes valid *while typing*
    useEffect(() => {
        if (isValid && localErrorMessage) {
            setLocalErrorMessage('');
        }
    }, [isValid, localErrorMessage]);

    // Combine parent's onChange with hook's handleFieldChange
    const combinedOnChange = useCallback((e) => {
        handleFieldChange(e); // Mark field as touched in the hook
        onFormChange(e);      // Update formData in the parent
    }, [handleFieldChange, onFormChange]);

    return (
        <div className="initial-details-section">
            <h3 className={styles.formTitle}>Step 2: Your Account Details</h3>
            <p className={styles.formDescription}>
                Please provide your personal and account information to complete your enrollment.
            </p>
            {localErrorMessage && (
                <p className={styles.localErrorMessage}>{localErrorMessage}</p>
            )}
            <AuthForm
                formData={formData}
                onChange={combinedOnChange} // Use the combined onChange
                fieldsConfig={enrollmentFieldsConfig}
                errors={fieldErrors}
                disabled={isSubmitting}
            />
        </div>
    );
};

AccountDetailsForm.propTypes = {
    formData: PropTypes.shape({
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        phoneNumber: PropTypes.string.isRequired,
        password: PropTypes.string.isRequired,
        confirmPassword: PropTypes.string.isRequired,
    }).isRequired,
    onFormChange: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    triggerValidation: PropTypes.bool,
};

export default AccountDetailsForm;