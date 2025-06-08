import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAuth, updateProfile } from 'firebase/auth';
import styles from '../../pages/studentDashboard/Profile.module.css';
import { Check, X, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EditProfileForm = ({ user, onSuccess, onCancel }) => {
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { refreshUser } = useAuth();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!displayName.trim()) {
      setError('Display Name cannot be empty.');
      setLoading(false);
      return;
    }

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError('No authenticated user found.');
        setLoading(false);
        return;
      }

      await updateProfile(currentUser, {
        displayName: displayName.trim(),
        photoURL: photoURL.trim() || null,
      });

      await refreshUser(); // 👈 this line updates your app context

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        onSuccess(); // Notify parent component
      }, 1000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
        <div className={styles.formCard}>
      {/* Corrected: h3 to h4 and added className for title styling */}
      <h4 className={styles.formTitle}>Edit Profile Information</h4>
      {/* Added className to the form itself */}
      <form onSubmit={handleSubmit} className={styles.profileForm}>
        {/* Added className to formGroup */}
        <div className={styles.formGroup}>
          {/* Added className to label */}
          <label htmlFor="displayName" className={styles.formLabel}>Display Name:</label>
          {/* Added className to input */}
          <input
            type="text"
            id="displayName"
            className={styles.input}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            disabled={loading}
            required
          />
        </div>
        {/* Added className to formGroup */}
        <div className={styles.formGroup}>
          {/* Added className to label */}
          <label htmlFor="photoURL" className={styles.formLabel}>Profile Photo URL:</label>
          {/* Added className to input */}
          <input
            type="url" 
            id="photoURL"
            className={styles.input} 
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            placeholder="e.g., https://example.com/your-avatar.jpg"
            disabled={loading}
          />
          {/* Added className for the hint text */}
          <p className={styles.inputHint}>Link to an image for your profile picture.</p>
        </div>

        {/* Corrected: Used errorMessage and successMessage classes */}
        {error && <p className={styles.errorMessage}><X size={16} /> {error}</p>}
        {successMessage && <p className={styles.successMessage}><Check size={16} /> {successMessage}</p>}

        {/* Corrected: Used formActions class for button container */}
        <div className={styles.formActions}>
          {/* Buttons already had correct classes */}
          <button type="submit" disabled={loading} className={`${styles.button} ${styles.saveButton}`}>
            <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>
            <X size={16} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

EditProfileForm.propTypes = {
  user: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default EditProfileForm;
