
// User profile page.

import { useAuth } from '../../context/AuthContext'; // Use YOUR useAuth
import styles from './Profile.module.css';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className={styles.loadingWrapper}>
        Loading profile data...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Profile</h2>
      <div className={styles.card}>
        <div className={styles.profileHeader}>
          <img
            src={user.photoURL || user.avatar || 'https://placehold.co/150x150/cccccc/333333?text=User'}
            alt="Profile Avatar"
            className={styles.avatar}
          />
          <h3 className={styles.userName}>{user.displayName || user.name || 'User'}</h3>
          <p className={styles.userEmail}>{user.email}</p>
          <span className={styles.roleBadge}>{user.role}</span>
        </div>

        <div className={styles.sectionDivider}>
          <h4 className={styles.sectionTitle}>Personal Information</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <p className={styles.infoLabel}>Full Name</p>
              <p className={styles.infoValue}>{user.displayName || user.name || 'N/A'}</p>
            </div>
            <div className={styles.infoItem}>
              <p className={styles.infoLabel}>Email Address</p>
              <p className={styles.infoValue}>{user.email}</p>
            </div>
            <div className={styles.infoItem}>
              <p className={styles.infoLabel}>Role</p>
              <p className={styles.infoValue}>{user.role}</p>
            </div>
            <div className={styles.infoItem}>
              <p className={styles.infoLabel}>Member Since</p>
              <p className={styles.infoValue}>Jan 2023 (Mock)</p>
            </div>
          </div>
        </div>

        <div className={styles.editButtonContainer}>
          <button className={styles.editButton}>Edit Profile</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
