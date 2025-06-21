import { forwardRef, useImperativeHandle, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import AuthForm from '../../common/AuthForm';
import useFormValidation from '../../../hooks/useFormValidation';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const AccountDetailsForm = forwardRef(({ formData, onFormChange, isSubmitting }, ref) => {
  const enrollmentFieldsConfig = useMemo(() => [
    {
      name: 'fName',
      label: 'First Name',
      type: 'text',
      required: true,
      autoComplete: 'given-name',
      placeholder: 'John',
      regex: /^[a-zA-Z]{2,}(?:[' -][a-zA-Z]{2,})*$/,
      minLength: 2,
      maxLength: 50,
      errorMessage: 'First name must be at least 2 characters and contain only letters.',
      inputMode: 'text',
      hint: 'Only letters, spaces, hyphens or apostrophes. E.g., John, Anne-Marie.',
    },
    {
      name: 'lName',
      label: 'Last Name',
      type: 'text',
      required: true,
      autoComplete: 'family-name',
      placeholder: 'Doe',
      regex: /^[a-zA-Z]{2,}(?:[' -][a-zA-Z]{2,})*$/,
      minLength: 2,
      maxLength: 50,
      errorMessage: 'Last name must be at least 2 characters and contain only letters.',
      inputMode: 'text',
      hint: 'Only letters, spaces, hyphens or apostrophes. E.g., O’Connor.',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      autoComplete: 'email',
      placeholder: 'example@domain.com',
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      maxLength: 254,
      inputMode: 'email',
      errorMessage: 'Please enter a valid email address.',
      hint: 'Use a valid business or personal email.',
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      type: 'tel',
      required: true,
      autoComplete: 'tel',
      placeholder: '+251912345678',
      validator: (value) => {
        if (!value) return 'Phone number is required.';
        try {
          const phone = parsePhoneNumberFromString(value);
          if (!phone?.isValid()) {
            return 'Enter a valid phone number with country code.';
          }
        } catch {
          return 'Phone number format is invalid.';
        }
        return null;
      },
      inputMode: 'tel',
      hint: 'Use international format including country code (e.g., +251912345678).',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      autoComplete: 'new-password',
      placeholder: '••••••••',
      minLength: 8,
      maxLength: 128,
      regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`]).{8,}$/,
      errorMessage: 'Must include uppercase, lowercase, number, and symbol.',
      hint: 'At least 8 characters. Include uppercase, lowercase, number, and symbol.',
      inputMode: 'text',
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      required: true,
      autoComplete: 'new-password',
      placeholder: '••••••••',
      matches: 'password',
      errorMessage: 'Passwords do not match.',
      hint: 'Re-enter the exact same password.',
      inputMode: 'text',
    }
  ], []);

  const {
    fieldErrors,
    isValid,
    validate,
    handleFieldChange,
    handleBlur,
    resetValidation,
  } = useFormValidation(formData, enrollmentFieldsConfig);

  const combinedOnChange = useCallback((e) => {
    handleFieldChange(e);
    onFormChange(e);
  }, [handleFieldChange, onFormChange]);

  const combinedOnBlur = useCallback((e) => {
    handleBlur(e);
  }, [handleBlur]);

  useImperativeHandle(ref, () => ({
    triggerFormValidation: () => validate(),
    resetFormValidation: resetValidation,
  }));

  return (
    <div className="initial-details-section">
      <AuthForm
        formData={formData}
        onChange={combinedOnChange}
        onBlur={combinedOnBlur}
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
