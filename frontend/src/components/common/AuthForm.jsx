import React from "react";
import PropTypes from "prop-types";
import styles from "./AuthForm.module.css"; 

const AuthForm = ({
  formData,
  onChange,
  onBlur, 
  submitButtonText,
  disabled = false,
  fieldsConfig = [],
  errors = {},
  children,
}) => {
  const renderInputField = (field) => (
    <div key={field.name} className={styles.inputGroup}>
      <label htmlFor={field.name} className={styles.label}>
        {field.label}
        {field.required && <span className={styles.requiredIndicator}>*</span>}
      </label>
      <input
        type={field.type || "text"}
        id={field.name}
        name={field.name}
        placeholder={field.placeholder || `Enter your ${field.label}`}
        value={formData[field.name] || ""}
        onChange={onChange}
        onBlur={onBlur}
        required={field.required}
        className={`${styles.input} ${
          errors[field.name] ? styles.inputError : ""
        }`}
        disabled={disabled}
        autoComplete={field.autoComplete || 'off'} 
        inputMode={field.inputMode || 'text'} 
      />
      
      {errors[field.name] && (
        <p className={styles.fieldError}>{errors[field.name]}</p>
      )}
    </div>
  );

  return (
    <div className={styles.formContainer}>
      {fieldsConfig.length > 0 && (
        <div className={styles.formRow}>
          {fieldsConfig.map(renderInputField)}
        </div>
      )}

      {children}

      {submitButtonText && (
        <button
          type="submit"
          className={`${styles.button} ${styles.primaryButton}`}
          disabled={disabled}
        >
          {submitButtonText}
        </button>
      )}
    </div>
  );
};

AuthForm.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func, 
  submitButtonText: PropTypes.string,
  disabled: PropTypes.bool,
  fieldsConfig: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
      placeholder: PropTypes.string,
      required: PropTypes.bool,
      autoComplete: PropTypes.string, 
      regex: PropTypes.instanceOf(RegExp),
      minLength: PropTypes.number,
      maxLength: PropTypes.number,
      errorMessage: PropTypes.string,
      inputMode: PropTypes.string,
      hint: PropTypes.string, 
    })
  ).isRequired,
  errors: PropTypes.object,
  children: PropTypes.node,
};

export default React.memo(AuthForm);
