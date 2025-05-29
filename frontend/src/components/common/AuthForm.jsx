// src/components/common/AuthForm/AuthForm.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styles from './AuthForm.module.css'; // Import the CSS Module

const AuthForm = ({
  formData,
  onChange,
  submitButtonText = 'Submit',
  disabled = false,
  fieldsConfig = [],
  children,
}) => {
  return (
    <div className={styles.formContainer}> {/* Use CSS Module class */}
      {fieldsConfig.map((field) => (
        <div key={field.name} className={styles.inputGroup}> {/* Changed to inputGroup for clarity */}
          {/* Add a label for each input for accessibility and clear UI */}
          <label htmlFor={field.name} className={styles.label}>
            {field.label}
            {field.required && <span className={styles.requiredIndicator}>*</span>}
          </label>
          <input
            type={field.type || 'text'}
            id={field.name} // Ensure id matches htmlFor for accessibility
            name={field.name}
            placeholder={field.placeholder || `Enter your ${field.label}`}
            value={formData[field.name] || ''}
            onChange={onChange}
            required={field.required}
            className={styles.input} /* Use CSS Module class */
            disabled={disabled}
          />
        </div>
      ))}

      {children} {/* Renders any additional content passed into AuthForm */}

      <button
        type="submit"
        className={`${styles.button} ${styles.primaryButton}`} 
        disabled={disabled}
      >
        {submitButtonText}
      </button>
    </div>
  );
};

AuthForm.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string,
  disabled: PropTypes.bool,
  fieldsConfig: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
      placeholder: PropTypes.string,
      required: PropTypes.bool,
    })
  ),
  children: PropTypes.node,
};

export default AuthForm;
