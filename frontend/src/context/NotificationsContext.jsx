// src/context/NotificationsContext.jsx
import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

// Ensure your AuthContext path is correct
import { useAuth } from './AuthContext';
// Import the hook and its messages
import useNotifications, {
    NOTIFICATION_MESSAGES as HookMessages,
} from '../hooks/useNotifications';

const NotificationsContext = createContext(undefined);

/**
 * Custom hook to consume NotificationsContext.
 * Throws an error if used outside of its provider, ensuring proper usage.
 * @returns {object} The context value provided by NotificationsProvider.
 */
export const useNotificationsContext = () => {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotificationsContext must be used within a <NotificationsProvider>');
    }
    return context;
};

/**
 * NotificationsProvider: A React Context Provider that wraps the useNotifications hook
 * and makes its state and actions available to any descendant component.
 * It also provides fallback values if the user is not authenticated or still loading,
 * preventing errors in consuming components.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider's scope.
 */
export const NotificationsProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();

    // Pass the user's UID to the useNotifications hook.
    // If user is null or undefined, pass null, which the hook handles gracefully.
    const notificationsHookData = useNotifications(user?.uid ?? null);

    // Define a stable fallback state object using useMemo.
    // This state is provided when authentication is loading or no user is logged in.
    const fallbackState = useMemo(() => ({
        notifications: [],
        loading: authLoading, // Reflects the authentication loading state
        error: null,
        clearing: false,
        markingAll: false,
        toastMessage: null,
        requiresConfirmation: null,
        // No-op functions for when the user is not authenticated/loading.
        // This prevents errors if components try to call these functions prematurely.
        markAsRead: () => { /* no-op */ },
        markAllAsRead: () => { /* no-op */ },
        requestClearAllConfirmation: () => { /* no-op */ },
        confirmClearAllNotifications: () => { /* no-op */ },
        requestDeleteConfirmation: () => { /* no-op */ },
        confirmDeleteNotification: () => { /* no-op */ },
        cancelConfirmation: () => { /* no-op */ },
        NOTIFICATION_MESSAGES: HookMessages, // Always expose the message constants
    }), [authLoading]); // Recompute only if authLoading changes

    // Memoize the actual context value to optimize performance.
    // This prevents unnecessary re-renders of consuming components.
    const contextValue = useMemo(() => {
        // If authentication is still loading or no user is logged in, provide the fallback state.
        if (authLoading || !user?.uid) {
            return fallbackState;
        }

        // When authenticated and loaded, spread all properties from the hook.
        // Importantly, explicitly destructure and omit 'notificationToDeleteId'
        // as it's an internal state of the hook and not needed by consumers.
        const { notificationToDeleteId, ...restOfNotificationsHookData } = notificationsHookData;

        return {
            ...restOfNotificationsHookData,
            NOTIFICATION_MESSAGES: HookMessages, // Ensure constants are always included
        };
    }, [authLoading, user, notificationsHookData, fallbackState]); // Dependencies for useMemo

    return (
        <NotificationsContext.Provider value={contextValue}>
            {children}
        </NotificationsContext.Provider>
    );
};

NotificationsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// Re-export the message constants for direct import if needed elsewhere in the app.
export { HookMessages as NOTIFICATION_MESSAGES };

export default NotificationsContext;