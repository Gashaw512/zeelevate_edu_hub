// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    updateDoc,
    doc,
    writeBatch,
    getDocs,
    deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firestore'; // Ensure this path is correct for your Firebase init

export const NOTIFICATION_MESSAGES = {
    NO_USER_AUTH: "Cannot perform action: User not authenticated.",
    NOTIF_LOAD_ERROR: "Failed to load notifications. Please check your connection or permissions.",
    CLEAR_ALL_ERROR: "Failed to clear all notifications. Please try again.",
    MARK_SINGLE_READ_ERROR: "Failed to mark notification as read. Please try again.",
    MARK_ALL_READ_ERROR: "Failed to mark all notifications as read. Please try again.",
    DELETE_SINGLE_ERROR: "Failed to delete notification. Please try again.",
    LOADING_NOTIFICATIONS: "Loading notifications...",
    NO_NEW_NOTIFICATIONS: "You don't have any notifications yet.",
    NO_NEW_NOTIFICATIONS_UNREAD: "No unread notifications! You're all caught up.",
    CLEARING_NOTIFICATIONS: "Clearing...",
    MARKING_ALL_READ: "Marking all as read...",
    CLEAR_ALL_SUCCESS: "All notifications cleared!",
    MARK_ALL_READ_SUCCESS: "All unread notifications marked as read!",
    DELETE_SINGLE_SUCCESS: "Notification deleted successfully!",
    CONFIRM_CLEAR_ALL: "Are you sure you want to clear all notifications? This action cannot be undone.",
    CONFIRM_DELETE_SINGLE: "Are you sure you want to delete this notification? This action cannot be undone.",
    CLEAR_ALL: "Clear All",
    MARK_AS_READ: "Mark as Read",
};

/**
 * Custom React hook for managing user notifications with real-time Firebase updates.
 *
 * @param {string | null | undefined} userId The ID of the current user. Notifications are fetched for this user.
 * @returns {object} An object containing notification data, loading/error states, and action functions.
 */
const useNotifications = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clearing, setClearing] = useState(false); // State for 'clearing all' loading
    const [markingAll, setMarkingAll] = useState(false); // State for 'marking all as read' loading
    const [toastMessage, setToastMessage] = useState(null); // { type: 'success'|'error'|'info', message: string }

    // State to control confirmation modals.
    // Format: null | { type: 'clearAll' } | { type: 'deleteSingle', id: string }
    const [requiresConfirmation, setRequiresConfirmation] = useState(null);

    // Effect to automatically clear toast messages after a delay
    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(null), 5000);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    // Effect to subscribe to real-time notification updates from Firestore
    useEffect(() => {
        if (!userId) {
            if (process.env.NODE_ENV === 'development') {
                console.warn("useNotifications: No user ID available. Notification listener not initialized.");
            }
            setNotifications([]);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('recipientId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(20) // Limit to the most recent 20 notifications
        );

        const unsubscribe = onSnapshot(
            notificationsQuery,
            (snapshot) => {
                setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
                setError(null); // Clear any previous errors on successful fetch
            },
            (err) => {
                console.error("useNotifications: Error fetching real-time notifications:", err);
                setError(NOTIFICATION_MESSAGES.NOTIF_LOAD_ERROR);
                setLoading(false);
            }
        );

        // Cleanup function for the effect: unsubscribe from the real-time listener
        return unsubscribe;
    }, [userId]); // Re-run effect if userId changes

    /**
     * Marks a single notification as read.
     * @param {string} id The ID of the notification to mark as read.
     */
    const markAsRead = useCallback(async (id) => {
        if (!userId) {
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
            return;
        }
        try {
            await updateDoc(doc(db, 'notifications', id), { read: true });
            // Firestore listener will automatically update `notifications` state upon success
            setError(null); // Clear any previous error
        } catch (err) {
            console.error("useNotifications: Error marking single notification as read:", err);
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.MARK_SINGLE_READ_ERROR });
        }
    }, [userId]);

    /**
     * Marks all unread notifications for the current user as read.
     */
    const markAllAsRead = useCallback(async () => {
        if (!userId) {
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
            return;
        }
        setMarkingAll(true);
        setError(null);
        setToastMessage(null); // Clear any existing toast messages

        try {
            const unreadQuery = query(
                collection(db, 'notifications'),
                where('recipientId', '==', userId),
                where('read', '==', false)
            );
            const snapshot = await getDocs(unreadQuery);

            if (snapshot.empty) {
                setToastMessage({ type: 'info', message: NOTIFICATION_MESSAGES.NO_NEW_NOTIFICATIONS_UNREAD });
                return;
            }

            const batch = writeBatch(db);
            snapshot.docs.forEach(docSnap => {
                batch.update(doc(db, 'notifications', docSnap.id), { read: true });
            });
            await batch.commit();

            setToastMessage({ type: 'success', message: NOTIFICATION_MESSAGES.MARK_ALL_READ_SUCCESS });
        } catch (err) {
            console.error("useNotifications: Error marking all notifications as read:", err);
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.MARK_ALL_READ_ERROR });
        } finally {
            setMarkingAll(false);
        }
    }, [userId]);

    /**
     * Sets the state to request confirmation for clearing all notifications.
     */
    const requestClearAllConfirmation = useCallback(() => {
        if (!userId) {
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
            return;
        }
        setRequiresConfirmation({ type: 'clearAll' });
    }, [userId]);

    /**
     * Confirms and proceeds with clearing all notifications for the current user.
     */
    const confirmClearAllNotifications = useCallback(async () => {
        if (!userId) {
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
            setRequiresConfirmation(null); // Close modal if not authenticated
            return;
        }
        setClearing(true);
        setError(null);
        setToastMessage(null);
        setRequiresConfirmation(null); // Crucially, clear the modal state immediately

        try {
            const userNotificationsQuery = query(
                collection(db, 'notifications'),
                where('recipientId', '==', userId)
            );
            const snapshot = await getDocs(userNotificationsQuery);

            if (snapshot.empty) {
                setToastMessage({ type: 'info', message: NOTIFICATION_MESSAGES.NO_NEW_NOTIFICATIONS });
                return;
            }

            const batch = writeBatch(db);
            snapshot.docs.forEach(docSnap => batch.delete(doc(db, 'notifications', docSnap.id)));
            await batch.commit();

            setToastMessage({ type: 'success', message: NOTIFICATION_MESSAGES.CLEAR_ALL_SUCCESS });
        } catch (err) {
            console.error("useNotifications: Error clearing all notifications:", err);
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.CLEAR_ALL_ERROR });
        } finally {
            setClearing(false);
        }
    }, [userId]);

    /**
     * Sets the state to request confirmation for deleting a single notification.
     * @param {string} notificationId The ID of the notification to be deleted.
     */
    const requestDeleteConfirmation = useCallback((notificationId) => {
        if (!userId) {
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
            return;
        }
        // Store the ID directly within the requiresConfirmation state
        setRequiresConfirmation({ type: 'deleteSingle', id: notificationId });
    }, [userId]);

    /**
     * Confirms and proceeds with deleting the single selected notification.
     * This function now correctly retrieves the ID from `requiresConfirmation` state,
     * preventing stale closure issues.
     */
    const confirmDeleteNotification = useCallback(async () => {
        if (!userId) {
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
            setRequiresConfirmation(null); // Close modal if not authenticated
            return;
        }

        // --- THE CRITICAL FIX: Get the ID directly from the requiresConfirmation state ---
        const idToDelete = requiresConfirmation?.id;

        if (!idToDelete) {
            console.warn("useNotifications: No notification ID found in requiresConfirmation for deletion.");
            setToastMessage({ type: 'error', message: "Failed to delete: No notification ID found." });
            setRequiresConfirmation(null); // Ensure modal is closed if ID is missing
            return;
        }
        // --- END CRITICAL FIX ---

        setError(null);
        setToastMessage(null);
        setRequiresConfirmation(null); // IMPORTANT: Clear the modal state immediately

        try {
            await deleteDoc(doc(db, 'notifications', idToDelete)); // Use the reliably obtained ID
            setToastMessage({ type: 'success', message: NOTIFICATION_MESSAGES.DELETE_SINGLE_SUCCESS });
            // Firestore listener will automatically update `notifications` state
        } catch (err) {
            console.error("useNotifications: Error deleting notification:", err);
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.DELETE_SINGLE_ERROR });
        }
        // No `finally` block needed here for `notificationToDeleteId` as it's no longer a separate state
    }, [userId, requiresConfirmation]); // Dependency array now correctly includes `requiresConfirmation`

    /**
     * Cancels any active confirmation modal and resets its state.
     */
    const cancelConfirmation = useCallback(() => {
        setRequiresConfirmation(null);
    }, []);

    return {
        notifications,
        loading,
        error,
        clearing,
        markingAll,
        toastMessage,
        requiresConfirmation,
        // notificationToDeleteId is an internal state and no longer exposed.
        markAsRead,
        markAllAsRead,
        requestClearAllConfirmation,
        confirmClearAllNotifications,
        requestDeleteConfirmation,
        confirmDeleteNotification,
        cancelConfirmation,
        NOTIFICATION_MESSAGES, // Export the messages for consumer components
    };
};

export default useNotifications;