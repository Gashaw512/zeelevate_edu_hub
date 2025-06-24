// src/context/SettingsContext.js
import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import useSettings from '../hooks/useSettings';

// Create context
const SettingsContext = createContext(null);

// Hook to consume SettingsContext
export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a <SettingsProvider>');
  }
  return context;
};

// Provider Component
export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.uid;

  const {
    settings,
    loading,
    saving,
    error,
    successMessage,
    saveSettings,
    MESSAGES,
  } = useSettings(userId);

  const contextValue = {
    settings,
    loading,
    saving,
    error,
    successMessage,
    saveSettings,
    MESSAGES,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
