import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import useNotifications, { NOTIFICATION_MESSAGES as HookMessages } from '../hooks/useNotifications';

const NotificationsContext = createContext(undefined);

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  // Always call the hook - pass userId or null
  const notificationsState = useNotifications(user?.uid ?? null);

  // If no user or loading, override with fallback empty/default values:
  const value = useMemo(() => {
    if (authLoading || !user?.uid) {
      return {
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
    }

    return {
      ...notificationsState,
      NOTIFICATION_MESSAGES: HookMessages,
    };
  }, [authLoading, user, notificationsState]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { HookMessages as NOTIFICATION_MESSAGES };

export default NotificationsContext;
