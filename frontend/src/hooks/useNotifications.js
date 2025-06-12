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
    deleteDoc, // <--- Make sure deleteDoc is imported
} from 'firebase/firestore';
import { db } from '../firebase/firestore'; // Adjust path if necessary

// Define standard messages for better consistency and potential i18n later
export const NOTIFICATION_MESSAGES = {
    NO_USER_AUTH: "Cannot perform action: User not authenticated.",
    NOTIF_LOAD_ERROR: "Failed to load notifications. Please check your connection or permissions.",
    CLEAR_ALL_ERROR: "Failed to clear all notifications. Please try again.",
    MARK_SINGLE_READ_ERROR: "Failed to mark notification as read. Please try again.",
    MARK_ALL_READ_ERROR: "Failed to mark all notifications as read. Please try again.",
    DELETE_SINGLE_ERROR: "Failed to delete notification. Please try again.", // NEW
    LOADING_NOTIFICATIONS: "Loading notifications...",
    NO_NEW_NOTIFICATIONS: "You don't have any notifications yet.", // Adjusted for general empty state
    NO_NEW_NOTIFICATIONS_UNREAD: "No unread notifications! You're all caught up.", // Specific for unread filter
    CLEARING_NOTIFICATIONS: "Clearing...",
    MARKING_ALL_READ: "Marking all as read...",
    CLEAR_ALL_SUCCESS: "All notifications cleared!",
    MARK_ALL_READ_SUCCESS: "All unread notifications marked as read!",
    DELETE_SINGLE_SUCCESS: "Notification deleted successfully!", // NEW
    CONFIRM_CLEAR_ALL: "Are you sure you want to clear all notifications? This action cannot be undone.",
    CONFIRM_DELETE_SINGLE: "Are you sure you want to delete this notification? This action cannot be undone.", // NEW
    CLEAR_ALL: "Clear All", // For button text
    MARK_AS_READ: "Mark as Read", // For button text
};

const useNotifications = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clearing, setClearing] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    const [toastMessage, setToastMessage] = useState(null); // { type: 'success' | 'error' | 'info', message: string }

    // Unified state for confirmation prompts
    const [requiresConfirmation, setRequiresConfirmation] = useState(null); // { type: 'clearAll' | 'deleteSingle', id?: string }
    const [notificationToDeleteId, setNotificationToDeleteId] = useState(null); // Stores the ID for individual delete

    // Clear toast message after a short period
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage(null);
            }, 5000); // Clears after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);


    useEffect(() => {
        if (!userId) {
            console.warn("useNotifications: No user ID available for notification listener. Clearing notifications.");
            setNotifications([]);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);
        console.log(`useNotifications: Setting up real-time listener for user: ${userId}`);

        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('recipientId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(
            notificationsQuery,
            (snapshot) => {
                const fetchedNotifications = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setNotifications(fetchedNotifications);
                setLoading(false);
                setError(null);
                console.log(`useNotifications: Fetched ${fetchedNotifications.length} real-time notifications.`);
            },
            (err) => {
                console.error("useNotifications: Error fetching real-time notifications:", err);
                setError(NOTIFICATION_MESSAGES.NOTIF_LOAD_ERROR);
                setLoading(false);
            }
        );

        return () => {
            console.log("useNotifications: Unsubscribing from real-time listener.");
            unsubscribe();
        };
    }, [userId]);

    const markAsRead = useCallback(async (id) => {
        if (!userId) {
            console.warn("useNotifications: " + NOTIFICATION_MESSAGES.NO_USER_AUTH);
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
            return;
        }
        try {
            const notificationRef = doc(db, 'notifications', id);
            await updateDoc(notificationRef, { read: true });
            console.log(`useNotifications: Notification ${id} marked as read.`);
            setError(null);
        } catch (err) {
            console.error("useNotifications: Error marking single notification as read:", err);
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.MARK_SINGLE_READ_ERROR });
        }
    }, [userId]);

    const markAllAsRead = useCallback(async () => {
        if (!userId) {
            console.warn("useNotifications: " + NOTIFICATION_MESSAGES.NO_USER_AUTH);
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
            return;
        }

        setMarkingAll(true);
        setError(null);
        setToastMessage(null);

        try {
            const unreadNotificationsQuery = query(
                collection(db, 'notifications'),
                where('recipientId', '==', userId),
                where('read', '==', false)
            );

            const snapshot = await getDocs(unreadNotificationsQuery);
            const batch = writeBatch(db);

            if (snapshot.empty) {
                console.log("useNotifications: No unread notifications to mark as read.");
                setToastMessage({ type: 'info', message: NOTIFICATION_MESSAGES.NO_NEW_NOTIFICATIONS_UNREAD });
                return;
            }

            snapshot.docs.forEach((d) => {
                const notificationRef = doc(db, 'notifications', d.id);
                batch.update(notificationRef, { read: true });
            });

            await batch.commit();
            console.log(`useNotifications: Marked ${snapshot.docs.length} notifications as read for user ${userId}.`);
            setToastMessage({ type: 'success', message: NOTIFICATION_MESSAGES.MARK_ALL_READ_SUCCESS });
        } catch (err) {
            console.error("useNotifications: Error marking all notifications as read:", err);
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.MARK_ALL_READ_ERROR });
        } finally {
            setMarkingAll(false);
        }
    }, [userId]);

    // Function to initiate the 'Clear All' confirmation
    const requestClearAllConfirmation = useCallback(() => {
        if (!userId) {
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
            return;
        }
        setRequiresConfirmation({ type: 'clearAll' }); // Signal that clearAll needs confirmation
        setNotificationToDeleteId(null); // Ensure no individual ID is set
    }, [userId]);

    // Function to execute 'Clear All' after user confirms
    const confirmClearAllNotifications = useCallback(async () => {
        if (!userId) {
            console.warn("useNotifications: " + NOTIFICATION_MESSAGES.NO_USER_AUTH);
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
            return;
        }

        setClearing(true);
        setError(null);
        setToastMessage(null);
        setRequiresConfirmation(null); // Reset confirmation state

        try {
            const userNotificationsQuery = query(
                collection(db, 'notifications'),
                where('recipientId', '==', userId),
            );

            const snapshot = await getDocs(userNotificationsQuery);
            const batch = writeBatch(db);

            if (snapshot.empty) {
                console.log("useNotifications: No notifications to clear.");
                setToastMessage({ type: 'info', message: NOTIFICATION_MESSAGES.NO_NEW_NOTIFICATIONS });
                return;
            }

            snapshot.docs.forEach((d) => {
                batch.delete(doc(db, 'notifications', d.id));
            });

            await batch.commit();
            console.log(`useNotifications: Cleared ${snapshot.docs.length} notifications for user ${userId}.`);
            setToastMessage({ type: 'success', message: NOTIFICATION_MESSAGES.CLEAR_ALL_SUCCESS });
        } catch (err) {
            console.error("useNotifications: Error clearing all notifications:", err);
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.CLEAR_ALL_ERROR });
        } finally {
            setClearing(false);
        }
    }, [userId]);

    // NEW: Function to initiate confirmation for deleting a single notification
    const requestDeleteConfirmation = useCallback((notificationId) => {
        if (!userId) {
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
            return;
        }
        setNotificationToDeleteId(notificationId); // Store the ID of the notification to delete
        setRequiresConfirmation({ type: 'deleteSingle', id: notificationId }); // Signal single delete confirmation
    }, [userId]);

    // NEW: Function to execute deleting a single notification after user confirms
    const confirmDeleteNotification = useCallback(async () => {
        if (!userId) {
            console.warn("useNotifications: " + NOTIFICATION_MESSAGES.NO_USER_AUTH);
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
            return;
        }
        if (!notificationToDeleteId) {
            console.warn("useNotifications: No notification ID set for deletion confirmation.");
            // Maybe show an error toast here if this happens unexpectedly
            return;
        }

        setError(null);
        setToastMessage(null);
        setRequiresConfirmation(null); // Reset confirmation state
        const idToDelete = notificationToDeleteId; // Capture ID before clearing state
        setNotificationToDeleteId(null); // Clear the ID immediately

        try {
            const notificationRef = doc(db, 'notifications', idToDelete);
            await deleteDoc(notificationRef);
            console.log(`useNotifications: Notification ${idToDelete} deleted.`);
            setToastMessage({ type: 'success', message: NOTIFICATION_MESSAGES.DELETE_SINGLE_SUCCESS });
        } catch (err) {
            console.error("useNotifications: Error deleting single notification:", err);
            setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.DELETE_SINGLE_ERROR });
        }
    }, [userId, notificationToDeleteId]); 

  
    const cancelConfirmation = useCallback(() => {
        setRequiresConfirmation(null);
        setNotificationToDeleteId(null); 
    }, []);

    return {
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
        NOTIFICATION_MESSAGES 
    };
};

export default useNotifications;