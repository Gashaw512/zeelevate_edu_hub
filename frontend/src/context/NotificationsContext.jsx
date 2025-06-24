// src/context/NotificationsContext.jsx

import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { useAuth } from './AuthContext';
import useNotifications, {
  NOTIFICATION_MESSAGES as HookMessages,
} from '../hooks/useNotifications';

const NotificationsContext = createContext(undefined);

/**
 * Custom hook to consume NotificationsContext.
 * Throws an error if used outside of its provider.
 */
export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a <NotificationsProvider>');
  }
  return context;
};

/**
 * NotificationsProvider: Supplies notification state and actions
 * to the component tree via context. Falls back to no-op handlers
 * if user is not authenticated or still loading.
 */
export const NotificationsProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  const notifications = useNotifications(user?.uid ?? null);

  const fallbackState = {
    notifications: [],
    loading: authLoading,
    error: null,
    clearing: false,
    markingAll: false,
    toastMessage: null,
    requiresConfirmation: null,
    notificationToDeleteId: null,
    markAsRead: () => {},
    markAllAsRead: () => {},
    requestClearAllConfirmation: () => {},
    confirmClearAllNotifications: () => {},
    requestDeleteConfirmation: () => {},
    confirmDeleteNotification: () => {},
    cancelConfirmation: () => {},
    NOTIFICATION_MESSAGES: HookMessages,
  };

  const contextValue = useMemo(() => {
    return authLoading || !user?.uid
      ? fallbackState
      : {
          ...notifications,
          NOTIFICATION_MESSAGES: HookMessages,
        };
  }, [authLoading, user, notifications]);

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Optional re-export if needed elsewhere
export { HookMessages as NOTIFICATION_MESSAGES };

export default NotificationsContext;
