
import { useState, useEffect } from 'react';
import styles from './Settings.module.css';

import { useSettingsContext } from '../../context/SettingsContext'; 

const SettingsPage = () => {

  const {
    settings,
    loading,
    saving,
    error,
    successMessage,
    saveSettings,
    MESSAGES, 
  } = useSettingsContext(); 

  const [localEmailNotifications, setLocalEmailNotifications] = useState(false); 
  const [localDarkMode, setLocalDarkMode] = useState(false); 

 
  useEffect(() => {
   
    if (!loading && settings) {
      setLocalEmailNotifications(settings.emailNotifications);
      setLocalDarkMode(settings.darkMode);
    }
  }, [settings, loading]); // Depend on settings and loading state

  const handleSave = async () => {
    const newSettings = {
      emailNotifications: localEmailNotifications,
      darkMode: localDarkMode,
      // Add more settings here as you expand
    };
    await saveSettings(newSettings);
  
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingMessage}>{MESSAGES.LOADING}</div>
      </div>
    );
  }

 
  if (!settings) {
      return (
          <div className={styles.container}>
              <div className={styles.errorMessage}>Failed to load settings.</div>
          </div>
      );
  }


  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Account Settings</h2>

      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Notification Preferences</h3>
        <div className={styles.flexRow}>
          <label htmlFor="emailNotifications" className={styles.label}>
            Email Notifications
            <p className={styles.settingDescription}>Receive updates and alerts via email.</p>
          </label>
          <input
            type="checkbox"
            id="emailNotifications"
            checked={localEmailNotifications}
            onChange={() => setLocalEmailNotifications(!localEmailNotifications)}
            className={styles.checkbox}
          />
        </div>

        <h3 className={styles.sectionTitle}>Display Preferences</h3>
        <div className={styles.flexRow}>
          <label htmlFor="darkMode" className={styles.label}>
            Dark Mode
            <p className={styles.settingDescription}>Switch to a darker theme for reduced eye strain.</p>
          </label>
          <input
            type="checkbox"
            id="darkMode"
            checked={localDarkMode}
            onChange={() => setLocalDarkMode(!localDarkMode)}
            className={styles.checkbox}
          />
        </div>

        {/* Add more setting sections here */}
        <h3 className={styles.sectionTitle}>Privacy</h3>
        <div className={styles.flexRow}>
          <label htmlFor="dataPrivacy" className={styles.label}>
            Data Privacy
            <p className={styles.settingDescription}>Manage how your data is used and shared.</p>
          </label>
          <button className={styles.linkButton}>View Privacy Policy</button>
        </div>


        <div className={styles.buttonContainer}>
          {error && <p className={styles.errorMessage}>{error.message}</p>}
          {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
          <button
            className={styles.button}
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? MESSAGES.SAVING : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;