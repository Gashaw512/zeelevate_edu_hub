
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import PropTypes from 'prop-types';
import AuthForm from '../../common/AuthForm';
import styles from './AccountDetailsForm.module.css';
import useFormValidation from '../../../hooks/useFormValidation';

const AccountDetailsForm = forwardRef(({ formData, onFormChange, isSubmitting }, ref) => {
    const enrollmentFieldsConfig = useMemo(() => [
        { name: 'fName', label: 'First Name', type: 'text', required: true, autocomplete: 'given-name' },
        { name: 'lName', label: 'Last Name', type: 'text', required: true, autocomplete: 'family-name' },
        { name: 'email', label: 'Email Address', type: 'email', required: true, autocomplete: 'email' },
        { name: 'phoneNumber', label: 'Phone Number', type: 'tel', required: true, autocomplete: 'tel' },
        { name: 'password', label: 'Password', type: 'password', required: true, autocomplete: 'new-password' },
        { name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true, autocomplete: 'new-password' },
    ], []);

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
            <AuthForm
                formData={formData}
                onChange={combinedOnChange}
                fieldsConfig={enrollmentFieldsConfig} // Pass the updated config
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