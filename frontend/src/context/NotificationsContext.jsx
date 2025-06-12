// src/context/NotificationsContext.js
import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import useNotifications, { NOTIFICATION_MESSAGES as HookMessages } from '../hooks/useNotifications'; // Renamed to avoid conflict

// Create the context
const NotificationsContext = createContext(null);

// Custom hook to consume the context
export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
};

// Provider component that wraps your application or parts of it
export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();

  const {
    notifications,
    loading,
    error,
    clearing,
    markingAll,
    toastMessage,
    requiresConfirmation,
    notificationToDeleteId,
    markAsRead,
    markAllAsRead,
    requestClearAllConfirmation,
    confirmClearAllNotifications,
    requestDeleteConfirmation,
    confirmDeleteNotification,
    cancelConfirmation,
  } = useNotifications(user?.uid);

  const value = {
    notifications,
    loading,
    error,
    clearing,
    markingAll,
    toastMessage,
    requiresConfirmation,
    notificationToDeleteId,
    markAsRead,
    markAllAsRead,
    requestClearAllConfirmation,
    confirmClearAllNotifications,
    requestDeleteConfirmation,
    confirmDeleteNotification,
    cancelConfirmation,
    NOTIFICATION_MESSAGES: HookMessages // Provide the original messages object as part of context value
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Explicitly export NOTIFICATION_MESSAGES from this context file
export { HookMessages as NOTIFICATION_MESSAGES }; // <--- ADD THIS LINE

export default NotificationsContext;