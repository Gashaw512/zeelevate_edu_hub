// --- src/pages/Settings.jsx ---
// Settings page for user preferences.
import { useState } from 'react';
import styles from './Settings.module.css';

const SettingsPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Settings</h2>
      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Notification Preferences</h3>
        <div className={styles.flexRow}>
          <label htmlFor="emailNotifications" className={styles.label}>Email Notifications</label>
          <input
            type="checkbox"
            id="emailNotifications"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
            className={styles.checkbox}
          />
        </div>

        <h3 className={styles.sectionTitle}>Display Preferences</h3>
        <div className={styles.flexRow}>
          <label htmlFor="darkMode" className={styles.label}>Dark Mode</label>
          <input
            type="checkbox"
            id="darkMode"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className={styles.checkbox}
          />
        </div>

        <div className={styles.buttonContainer}>
          <button className={styles.button}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
