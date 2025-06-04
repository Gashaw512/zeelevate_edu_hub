import { forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import AuthForm from '../../common/AuthForm';
import styles from './AccountDetailsForm.module.css';
import useFormValidation from '../../../hooks/useFormValidation';

const AccountDetailsForm = forwardRef(({ formData, onFormChange, isSubmitting }, ref) => {
    const enrollmentFieldsConfig = [
        { name: 'fName', label: 'First Name', type: 'text', required: true },
        { name: 'lName', label: 'Last Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phoneNumber', label: 'Phone Number', type: 'tel', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
        { name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true },
    ];

    const { 
        fieldErrors, 
        isValid, 
        validate, 
        handleFieldChange,
        resetValidation
    } = useFormValidation(formData, enrollmentFieldsConfig);

    const combinedOnChange = (e) => {
        handleFieldChange(e);
        onFormChange(e);
    };

    useImperativeHandle(ref, () => ({
        triggerFormValidation: () => {
            validate();
            return isValid;
        },
        resetFormValidation: resetValidation
    }));

    return (
        <div className="initial-details-section">
            <h3 className={styles.formTitle}>Step 2: Your Account Details</h3>
            <p className={styles.formDescription}>
                Please provide your personal and account information to complete your enrollment.
            </p>
            <AuthForm
                formData={formData}
                onChange={combinedOnChange}
                fieldsConfig={enrollmentFieldsConfig}
                errors={fieldErrors}
                disabled={isSubmitting}
            />
        </div>
    );
});

AccountDetailsForm.displayName = 'AccountDetailsForm';

AccountDetailsForm.propTypes = {
    formData: PropTypes.object.isRequired,
    onFormChange: PropTypes.func.isRequired,
    isSubmitting: PropTypes.bool,
};

export default AccountDetailsForm;