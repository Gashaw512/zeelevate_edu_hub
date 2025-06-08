// src/components/Profile/ChangePasswordForm.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../../pages/studentDashboard/Profile.module.css';
import {
  Check,
  X,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
// import { EmailAuthProvider } from 'firebase/auth';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';


const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*#?&]/.test(password)) score++;

  if (score <= 2) return { level: 'Weak', color: 'red' };
  if (score === 3) return { level: 'Medium', color: 'orange' };
  return { level: 'Strong', color: 'green' };
};

const ChangePasswordForm = ({ user, onSuccess, onCancel }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const togglePasswordVisibility = () => {
    setShowPasswords((prev) => !prev);
  };

  const handleFirebaseError = (err) => {
    console.error("Firebase error:", err);
    let errorMessage = 'An error occurred. Please try again.';

    if (err.code) {
      switch (err.code) {
        case 'auth/wrong-password':
          errorMessage = 'Incorrect current password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid current password or session expired.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
    }

    setError(errorMessage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!user || !user.email) {
  setError("User is not logged in or missing email.");
  setLoading(false);
  return;
}


    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError('All password fields are required.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
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
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

    } catch (err) {
      handleFirebaseError(err);
      setLoading(false);
      return;
    }

    try {
      await updatePassword(user, newPassword);

      setSuccessMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className={styles.formCard}>
      <h4 className={styles.formTitle}>Change Password</h4>
      <form onSubmit={handleSubmit} className={styles.profileForm} aria-disabled={loading}>
        {/* Current Password */}
        <div className={styles.formGroup}>
          <label htmlFor="currentPassword" className={styles.formLabel}>Current Password:</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="currentPassword"
              className={styles.input}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              disabled={loading}
              required
              autoComplete="current-password"
            />
            <span onClick={togglePasswordVisibility} className={styles.eyeIcon}>
              {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        {/* New Password */}
        <div className={styles.formGroup}>
          <label htmlFor="newPassword" className={styles.formLabel}>New Password:</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="newPassword"
              className={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              disabled={loading}
              required
              autoComplete="new-password"
            />
            <span onClick={togglePasswordVisibility} className={styles.eyeIcon}>
              {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          {newPassword && (
            <div className={styles.passwordStrength}>
              <ShieldCheck size={14} color={strength.color} />
              <span style={{ color: strength.color, marginLeft: '0.5rem' }}>{strength.level}</span>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div className={styles.formGroup}>
          <label htmlFor="confirmNewPassword" className={styles.formLabel}>Confirm New Password:</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="confirmNewPassword"
              className={styles.input}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm your new password"
              disabled={loading}
              required
              autoComplete="new-password"
            />
            <span onClick={togglePasswordVisibility} className={styles.eyeIcon}>
              {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        {/* Error or Success */}
        {error && (
          <p className={styles.errorMessage} role="alert" aria-live="assertive">
            <AlertCircle size={16} /> {error}
          </p>
        )}
        {successMessage && (
          <p className={styles.successMessage} role="status" aria-live="polite">
            <Check size={16} /> {successMessage}
          </p>
        )}

        {/* Buttons */}
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
  user: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ChangePasswordForm;
