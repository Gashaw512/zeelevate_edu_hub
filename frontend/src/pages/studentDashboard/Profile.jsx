
// User profile page.


import { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Ensure this provides the full Firebase user object
import styles from './Profile.module.css';
import EditProfileForm from '../../components/Profiel/EditProfileForm'; // New component
import ChangePasswordForm from '../../components/Profiel/ChangePasswordForm'; // New component
import { User, Mail, Shield, Calendar, Edit, Lock } from 'lucide-react'; // Example icons

const Profile = () => {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fallback for user data if not fully loaded or missing
  const displayName = user?.displayName || user?.name || 'N/A';
  const email = user?.email || 'N/A';
  const photoURL = user?.photoURL || user?.avatar || 'https://placehold.co/150x150/cccccc/333333?text=User';
  const role = user?.role || 'User'; // Assuming 'role' is part of your custom user data
  const memberSince = user?.metadata?.creationTime ?
    new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';

  if (!user) {
    return (
      <div className={styles.loadingWrapper}>
        <p>Loading profile data...</p>
      </div>
    );
  }

  // Handlers to close the forms
  const handleEditProfileCancel = () => setIsEditingProfile(false);
  const handleChangePasswordCancel = () => setIsChangingPassword(false);

  // Handlers for successful operations
  const handleProfileUpdateSuccess = () => {
    setIsEditingProfile(false);
    // Optionally, show a toast notification here if you have one
    console.log("Profile updated successfully!");
  };

  const handleChangePasswordSuccess = () => {
    setIsChangingPassword(false);
    // Optionally, show a toast notification here
    console.log("Password changed successfully!");
    alert("Password changed successfully! Please log in again with your new password if prompted.");
    // Firebase often requires re-login after password change for security
    // You might want to sign out the user here to enforce re-login
    // auth.signOut(); // If you have auth exposed from AuthContext
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Profile</h2>

      <div className={styles.card}>
        <div className={styles.profileHeader}>
          <img src={photoURL} alt="Profile Avatar" className={styles.avatar} />
          <h3 className={styles.userName}>{displayName}</h3>
          <p className={styles.userEmail}>{email}</p>
          <span className={styles.roleBadge}>{role}</span>
        </div>

        {/* Conditional Rendering for Edit Profile Form */}
        {isEditingProfile ? (
          <EditProfileForm
            user={user}
            onSuccess={handleProfileUpdateSuccess}
            onCancel={handleEditProfileCancel}
          />
        ) : isChangingPassword ? (
          <ChangePasswordForm
            user={user}
            onSuccess={handleChangePasswordSuccess}
            onCancel={handleChangePasswordCancel}
          />
        ) : (
          <>
            <div className={styles.sectionDivider}>
              <h4 className={styles.sectionTitle}>Personal Information</h4>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <p className={styles.infoLabel}><User size={16} className={styles.icon} /> Full Name</p>
                  <p className={styles.infoValue}>{displayName}</p>
                </div>
                <div className={styles.infoItem}>
                  <p className={styles.infoLabel}><Mail size={16} className={styles.icon} /> Email Address</p>
                  <p className={styles.infoValue}>{email}</p>
                </div>
                <div className={styles.infoItem}>
                  <p className={styles.infoLabel}><Shield size={16} className={styles.icon} /> Role</p>
                  <p className={styles.infoValue}>{role}</p>
                </div>
                <div className={styles.infoItem}>
                  <p className={styles.infoLabel}><Calendar size={16} className={styles.icon} /> Member Since</p>
                  <p className={styles.infoValue}>{memberSince}</p>
                </div>
              </div>
            </div>

            <div className={styles.editButtonContainer}>
              <button
                className={styles.editButton}
                onClick={() => setIsEditingProfile(true)}
              >
                <Edit size={18} className={styles.buttonIcon} /> Edit Profile
              </button>
              <button
                className={`${styles.editButton} ${styles.changePasswordButton}`}
                onClick={() => setIsChangingPassword(true)}
              >
                <Lock size={18} className={styles.buttonIcon} /> Change Password
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
