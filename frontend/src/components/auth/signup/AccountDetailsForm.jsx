import { forwardRef, useImperativeHandle, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import AuthForm from "../../common/AuthForm";
// import styles from "./AccountDetailsForm.module.css";
import useFormValidation from "../../../hooks/useFormValidation";

const AccountDetailsForm = forwardRef(
  ({ formData, onFormChange, isSubmitting }, ref) => {
    // Define the configuration for form fields and their validation rules.
    // This configuration is memoized to prevent unnecessary re-creations on re-renders.
    const enrollmentFieldsConfig = useMemo(
      () => [
        {
          name: "fName",
          label: "First Name",
          type: "text",
          required: true,
          autoComplete: "given-name",
          placeholder: "John",
          regex: /^[a-zA-Z]{2,}(?:[' -][a-zA-Z]{2,})*$/, // Allows for hyphens/apostrophes
          minLength: 2,
          maxLength: 50,
          errorMessage:
            "First name must contain only letters and be at least 2 characters.",
          inputMode: "text",
          hint: "Use alphabetic characters only. E.g., John, Anne-Marie.",
        },
        {
          name: "lName",
          label: "Last Name",
          type: "text",
          required: true,
          autoComplete: "family-name",
          placeholder: "Doe",
          regex: /^[a-zA-Z]{2,}(?:[' -][a-zA-Z]{2,})*$/, // Same as above
          minLength: 2,
          maxLength: 50,
          errorMessage:
            "Last name must contain only letters and be at least 2 characters.",
          inputMode: "text",
          hint: "Use alphabetic characters only. E.g., Doe, O’Connor.",
        },
        {
          name: "email",
          label: "Email Address",
          type: "email",
          required: true,
          autoComplete: "email",
          placeholder: "example@domain.com",
          regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, // Basic but reliable pattern
          maxLength: 254, // As per email standards
          inputMode: "email",
          errorMessage:
            "Please enter a valid email address (e.g., example@domain.com).",
          hint: "Use a valid business or personal email.",
        },

        {
          name: "phoneNumber",
          label: "Phone Number",
          type: "tel",
          required: true,
          autoComplete: "tel",
          placeholder: "+1234567890",
          regex: /^\+?[1-9]\d{7,14}$/,
          errorMessage:
            "Please enter a valid phone number in international format (e.g., +1234567890).",
          maxLength: 16, 
          inputMode: "tel", 
          hint: "Use international format including country code (e.g., +251912345678)",
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
  errorMessage:
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
  hint: 'Use a mix of upper/lowercase letters, numbers, and symbols.',
  inputMode: 'text' 
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
  hint: 'Please re-enter the password exactly as above.',
  inputMode: 'text'
},

      ],
      []
    );

    
    const {
      fieldErrors, 
      isValid, 
      validate, 
      handleFieldChange, 
      handleBlur, 
      resetValidation,
    } = useFormValidation(formData, enrollmentFieldsConfig);

 
    const combinedOnChange = useCallback(
      (e) => {
        handleFieldChange(e); 
        onFormChange(e); 
      },
      [handleFieldChange, onFormChange]
    );

  
    const combinedOnBlur = useCallback(
      (e) => {
        handleBlur(e);
      },
      [handleBlur]
    );

   
    useImperativeHandle(ref, () => ({
      /**
       * Triggers a full form validation and returns its validity.
       * Useful for form submission.
       * @returns {boolean} True if the form is valid, false otherwise.
       */
      triggerFormValidation: () => {
   
        return validate();
      },
      /**
       * Resets all validation errors and touched states, making the form appear clean.
       */
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
  }
);


AccountDetailsForm.displayName = "AccountDetailsForm";


AccountDetailsForm.propTypes = {
  formData: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default AccountDetailsForm;
