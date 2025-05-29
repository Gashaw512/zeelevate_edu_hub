import React from 'react';
import PropTypes from 'prop-types';
// Assuming AuthForm is located at '../../common/AuthForm'
import AuthForm from '../../common/AuthForm';
import styles from './AccountDetailsForm.module.css'; // Still used for title/description styles

const AccountDetailsForm = ({ formData, onFormChange }) => {
  // Configuration for the fields to be rendered by AuthForm
  const enrollmentFieldsConfig = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', required: true },
    { name: 'phoneNumber', label: 'Phone Number', type: 'tel', placeholder: 'e.g., +1234567890', required: true },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', required: true },
  ];

  return (
    // The 'initial-details-section' class is assumed to be defined in a parent CSS file
    // (e.g., SignUp.css or a global stylesheet) and provides the overall container styling
    // like background, border, padding, and shadow for this step.
    <div className="initial-details-section">
      <h3 className={styles.formTitle}>Step 2: Your Account Details</h3>
      <p className={styles.formDescription}>
        Please provide your personal and account information to complete your enrollment.
      </p>
      {/* AuthForm component handles the rendering of inputs based on fieldsConfig */}
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
