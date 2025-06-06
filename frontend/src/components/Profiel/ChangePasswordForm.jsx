// src/components/Profile/ChangePasswordForm.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../../pages/studentDashboard/Profile.module.css'; 
import { Check, X, Key, AlertCircle } from 'lucide-react'; // Icons
import { EmailAuthProvider } from 'firebase/auth'; // Import EmailAuthProvider

const ChangePasswordForm = ({ user, onSuccess, onCancel }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // --- Client-side Validations ---
    if (!currentPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setError('All password fields are required.');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation do not match.');
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) { // Firebase default minimum password length is 6
      setError('New password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password cannot be the same as the current password.');
      setLoading(false);
      return;
    }

    try {
      // 1. Re-authenticate the user (Crucial for security)
      // This is needed if their last sign-in was not recent.
      // It helps prevent unauthorized password changes if a session is hijacked.
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);

      // 2. Update the password
      await user.updatePassword(newPassword);

      setSuccessMessage('Password changed successfully!');
      // Call parent's onSuccess handler after a short delay for message visibility
      setTimeout(() => {
        onSuccess();
      }, 1500); // Give user time to read success message

    } catch (err) {
      console.error("Error changing password:", err);
      // Handle specific Firebase Auth errors for better user feedback
      let errorMessage = 'Failed to change password. Please try again.';
      if (err.code) {
        switch (err.code) {
          case 'auth/wrong-password':
            errorMessage = 'Incorrect current password. Please try again.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          case 'auth/user-not-found': // Should not happen if user is authenticated
            errorMessage = 'User not found.';
            break;
          case 'auth/invalid-credential': // Can happen if reauthenticate fails in other ways
            errorMessage = 'Invalid current password or session expired. Please re-enter current password.';
            break;
          // Add other specific Firebase Auth error codes as needed
          default:
            errorMessage = err.message || errorMessage;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h4 className={styles.formTitle}>Change Password</h4>
      <form onSubmit={handleSubmit} className={styles.profileForm}>
        <div className={styles.formGroup}>
          <label htmlFor="currentPassword" className={styles.formLabel}>Current Password:</label>
          <input
            type="password"
            id="currentPassword"
            className={styles.input}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            disabled={loading}
            required
            autoComplete="current-password" // For better browser autofill
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="newPassword" className={styles.formLabel}>New Password:</label>
          <input
            type="password"
            id="newPassword"
            className={styles.input}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            disabled={loading}
            required
            autoComplete="new-password" // For better browser autofill
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="confirmNewPassword" className={styles.formLabel}>Confirm New Password:</label>
          <input
            type="password"
            id="confirmNewPassword"
            className={styles.input}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Confirm your new password"
            disabled={loading}
            required
            autoComplete="new-password" // For better browser autofill
          />
        </div>

        {error && <p className={styles.errorMessage}><AlertCircle size={16} /> {error}</p>}
        {successMessage && <p className={styles.successMessage}><Check size={16} /> {successMessage}</p>}

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={`${styles.button} ${styles.cancelButton}`}
            disabled={loading}
          >
            <X size={18} /> Cancel
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.saveButton}`}
            disabled={loading}
          >
            <Key size={18} /> {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

ChangePasswordForm.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired, // Email is needed for re-authentication
    updatePassword: PropTypes.func.isRequired,
    reauthenticateWithCredential: PropTypes.func.isRequired,
  }).isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ChangePasswordForm;