// src/components/common/AuthForm/AuthForm.jsx
import React from 'react';
import PropTypes from 'prop-types';

const AuthForm = ({
  formData,
  onChange,
  submitButtonText = 'Submit',
  disabled = false,
  fieldsConfig = [],
  children,
}) => {
  return (
    <div className="form-container">
      {fieldsConfig.map((field) => (
        <div key={field.name} className="input-container">
          <input
            type={field.type || 'text'}
            name={field.name}
            placeholder={field.placeholder || `Enter your ${field.label}`}
            value={formData[field.name] || ''}
            onChange={onChange}
            required={field.required}
            className="input"
            disabled={disabled}
          />
        </div>
      ))}

      {children}

      <button
        type="submit"
        className="button primary-button"
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
// 