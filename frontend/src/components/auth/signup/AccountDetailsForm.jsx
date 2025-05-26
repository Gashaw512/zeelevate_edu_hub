import React from 'react';
import PropTypes from 'prop-types';
import AuthForm from '../../common/AuthForm'; // Adjust path if necessary

const AccountDetailsForm = ({ formData, onFormChange }) => {
  const enrollmentFieldsConfig = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', required: true },
    { name: 'phoneNumber', label: 'Phone Number', type: 'tel', placeholder: 'e.g., +1234567890', required: true },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', required: true },
  ];

  return (
    <div className="initial-details-section">
      <h3>2. Your Account Details</h3>
      <AuthForm
        formData={formData}
        onChange={onFormChange}
        fieldsConfig={enrollmentFieldsConfig}
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
};

export default AccountDetailsForm;