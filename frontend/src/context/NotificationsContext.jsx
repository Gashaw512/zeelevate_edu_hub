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

    // The userId prop passed to useNotifications ensures it only listens when a user is authenticated.
    const notificationsHookData = useNotifications(user?.uid ?? null);

    // Define a fallback state for when the user is not authenticated or still loading.
    // This provides stable no-op functions and default values.
    const fallbackState = useMemo(() => ({
        notifications: [],
        loading: authLoading, // Reflects auth loading state
        error: null,
        clearing: false,
        markingAll: false,
        toastMessage: null,
        requiresConfirmation: null,
        // notificationToDeleteId is INTERNAL to useNotifications hook, no need to expose
        markAsRead: () => { /* no-op */ },
        markAllAsRead: () => { /* no-op */ },
        requestClearAllConfirmation: () => { /* no-op */ },
        confirmClearAllNotifications: () => { /* no-op */ },
        requestDeleteConfirmation: () => { /* no-op */ },
        confirmDeleteNotification: () => { /* no-op */ },
        cancelConfirmation: () => { /* no-op */ },
        NOTIFICATION_MESSAGES: HookMessages, // Expose constants
    }), [authLoading]); // Recalculate if authLoading changes

    // Memoize the context value to prevent unnecessary re-renders of consumers.
    // If auth is loading or no user is logged in, provide the fallback state.
    // Otherwise, provide the full state and actions from the useNotifications hook.
    const contextValue = useMemo(() => {
        if (authLoading || !user?.uid) {
            return fallbackState;
        }
        // Destructure the hook's return value and specifically omit notificationToDeleteId
        const { notificationToDeleteId, ...restOfNotificationsHookData } = notificationsHookData;

        return {
            ...restOfNotificationsHookData,
            NOTIFICATION_MESSAGES: HookMessages, // Ensure constants are always part of the context
        };
    }, [authLoading, user, notificationsHookData, fallbackState]);

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