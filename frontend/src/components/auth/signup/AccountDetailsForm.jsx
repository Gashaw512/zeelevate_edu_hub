import { forwardRef, useImperativeHandle, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import AuthForm from "../../common/AuthForm";
import useFormValidation from "../../../hooks/useFormValidation";

const AccountDetailsForm = forwardRef(({ formData, onFormChange, isSubmitting }, ref) => {
  const enrollmentFieldsConfig = useMemo(() => [
    {
      name: "fName",
      label: "First Name",
      type: "text",
      required: true,
      autoComplete: "given-name",
      placeholder: "John",
      regex: /^[a-zA-Z]{2,}(?:[' -][a-zA-Z]{2,})*$/,
      minLength: 2,
      maxLength: 50,
      errorMessage: "First name must be at least 2 characters and contain only letters.",
      hint: "Only letters, spaces, hyphens or apostrophes (e.g., John, Anne-Marie).",
      inputMode: "text",
    },
    {
      name: "lName",
      label: "Last Name",
      type: "text",
      required: true,
      autoComplete: "family-name",
      placeholder: "Doe",
      regex: /^[a-zA-Z]{2,}(?:[' -][a-zA-Z]{2,})*$/,
      minLength: 2,
      maxLength: 50,
      errorMessage: "Last name must be at least 2 characters and contain only letters.",
      hint: "Only letters, spaces, hyphens or apostrophes (e.g., O’Connor).",
      inputMode: "text",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
      autoComplete: "email",
      placeholder: "example@domain.com",
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      maxLength: 254,
      errorMessage: "Please enter a valid email address.",
      hint: "Use a valid email (e.g., name@domain.com).",
      inputMode: "email",
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      required: true,
      autoComplete: "tel",
      placeholder: "6122303456", // <- placeholder per your requirement
      validator: (value) => {
        const trimmed = value?.trim() || "";

        if (trimmed.startsWith("+")) {
          const phone = parsePhoneNumberFromString(trimmed);
          if (!phone || !phone.isValid()) {
            return "Please enter a valid phone number in international format (e.g., +251912345678) or a 10-digit local format (e.g., 6122303456).";
          }
          return null;
        }

        const tenDigitPattern = /^\d{10}$/;
        if (!tenDigitPattern.test(trimmed)) {
          return "Please enter a valid phone number in international format (e.g., +251912345678) or a 10-digit local format (e.g., 6122303456).";
        }

        return null;
      },
      errorMessage:
        "Please enter a valid phone number in international or 10-digit format.",
      hint:
        "Use +country code (e.g., +251912345678) or a 10-digit number (e.g., 6122303456).",
      inputMode: "tel",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: true,
      autoComplete: "new-password",
      placeholder: "••••••••",
      minLength: 8,
      maxLength: 128,
      regex:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`]).{8,}$/,
      errorMessage:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
      hint: "Include a mix of uppercase, lowercase, numbers, and symbols.",
      inputMode: "text",
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      required: true,
      autoComplete: "new-password",
      placeholder: "••••••••",
      matches: "password",
      errorMessage: "Passwords do not match.",
      hint: "Re-enter the same password as above.",
      inputMode: "text",
    },
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

AccountDetailsForm.displayName = "AccountDetailsForm";

AccountDetailsForm.propTypes = {
  formData: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default AccountDetailsForm;
