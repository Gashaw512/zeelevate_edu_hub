// components/common/AuthForm.jsx
import PropTypes from "prop-types";
import styles from "./AuthForm.module.css";

const AuthForm = ({
  formData,
  onChange,
  onSubmit, // Prop: function to call when the form is conceptually "submitted"
  submitButtonText, // This will now be optional
  disabled = false,
  fieldsConfig = [],
  errors = {}, // Object to hold field-specific error messages
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
        required={field.required}
        className={`${styles.input} ${
          errors[field.name] ? styles.inputError : ""
        }`}
        disabled={disabled}
      />
      {errors[field.name] && (
        <p className={styles.fieldError}>{errors[field.name]}</p>
      )}
    </div>
  );

  return (
    <div className={styles.formContainer}>
      {/* Render ALL fields within the horizontal form row */}
      {fieldsConfig.length > 0 && (
        <div className={styles.formRow}>
          {fieldsConfig.map(renderInputField)}
        </div>
      )}

      {children}

      {/* Conditionally render the submit button only if submitButtonText is provided */}
      {submitButtonText && (
        <button
          type="button" // Changed to type="button" to prevent automatic form submission
          className={`${styles.button} ${styles.primaryButton}`}
          disabled={disabled}
          onClick={onSubmit} // Explicitly trigger the onSubmit prop
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
  onSubmit: PropTypes.func, // onSubmit is now optional as it might not be passed
  submitButtonText: PropTypes.string, // submitButtonText is now optional
  disabled: PropTypes.bool,
  fieldsConfig: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
      placeholder: PropTypes.string,
      required: PropTypes.bool,
    })
  ).isRequired,
  errors: PropTypes.object,
  children: PropTypes.node,
};

export default AuthForm;