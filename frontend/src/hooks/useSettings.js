// src/hooks/useSettings.js (Revised)
import { useState, useEffect, useCallback } from 'react';

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  darkMode: false, // Default to light mode
};

const MESSAGES = {
  FETCH_SUCCESS: 'Settings loaded successfully.',
  FETCH_ERROR: 'Failed to load settings. Please try again.',
  SAVE_SUCCESS: 'Settings saved successfully!',
  SAVE_ERROR: 'Failed to save settings. Please try again.',
  SAVING: 'Saving settings...',
  LOADING: 'Loading settings...',
};

const useSettings = (userId) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Effect to apply dark mode class to body
  useEffect(() => {
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [settings.darkMode]); // Re-run when dark mode setting changes

  useEffect(() => {
    if (!userId) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const fetchUserSettings = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const storedSettings = localStorage.getItem(`userSettings_${userId}`);
        const parsedSettings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;
        setSettings(parsedSettings);
        setSuccessMessage(MESSAGES.FETCH_SUCCESS);
      } catch (err) {
        setError(new Error(MESSAGES.FETCH_ERROR));
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    };

    fetchUserSettings();
  }, [userId]);

  const saveSettings = useCallback(async (newSettings) => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem(`userSettings_${userId}`, JSON.stringify(newSettings));
      setSettings(newSettings);
      setSuccessMessage(MESSAGES.SAVE_SUCCESS);
    } catch (err) {
      setError(new Error(MESSAGES.SAVE_ERROR));
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [userId]);

  return {
    settings,
    loading,
    saving,
    error,
    successMessage,
    saveSettings,
    MESSAGES,
  };
};

export default useSettings;