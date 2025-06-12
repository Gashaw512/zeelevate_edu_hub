// src/context/SettingsContext.js
import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext'; // Import AuthContext to get userId
import useSettings from '../hooks/useSettings'; // Import the useSettings hook

// Create the context
const SettingsContext = createContext(null);

// Custom hook to consume the context
export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

// Provider component that wraps your application or parts of it
export const SettingsProvider = ({ children }) => {
  const { user } = useAuth(); // Get user from AuthContext
  const userId = user?.uid; // Extract userId for the hook

  // Use the useSettings hook to get all settings logic and data
  const {
    settings,
    loading,
    saving,
    error,
    successMessage,
    saveSettings,
    MESSAGES, // Pass the messages object from the hook
  } = useSettings(userId);

  // The value that will be provided to consumers of this context
  const value = {
    settings,
    loading,
    saving,
    error,
    successMessage,
    saveSettings,
    MESSAGES, // Include MESSAGES directly in the context value
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Export the default settings and messages directly from here as well, if needed elsewhere
// import { DEFAULT_SETTINGS, MESSAGES as HookMessages } from '../hooks/useSettings';
// export { DEFAULT_SETTINGS, HookMessages as SETTINGS_MESSAGES }; // If you need to expose them globally