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
    getDocs, // Needed for markAllAsRead and clearAllNotifications
} from 'firebase/firestore';
import { db } from '../firebase/firestore'; // Adjust path as needed

// Define standard messages for better consistency and potential i18n later
const MESSAGES = {
    NO_USER_AUTH: "Cannot perform action: User not authenticated.",
    NOTIF_LOAD_ERROR: "Failed to load notifications. Please check your connection or permissions.",
    CLEAR_ALL_ERROR: "Failed to clear all notifications. Please try again.",
    MARK_SINGLE_READ_ERROR: "Failed to mark notification as read. Please try again.", // Specific message
    MARK_ALL_READ_ERROR: "Failed to mark all notifications as read. Please try again.", // Specific message
    LOADING_NOTIFICATIONS: "Loading notifications...",
    NO_NEW_NOTIFICATIONS: "No new notifications.",
    CLEARING_NOTIFICATIONS: "Clearing...",
    MARKING_ALL_READ: "Marking all as read...", // New message
    CLEAR_ALL: "Clear All",
    MARK_AS_READ: "Mark as Read",
};

const useNotifications = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [clearing, setClearing] = useState(false);
    const [markingAll, setMarkingAll] = useState(false); // New state for marking all as read

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
            limit(20) // Limits to the 20 most recent notifications
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
                setError(MESSAGES.NOTIF_LOAD_ERROR);
                setLoading(false);
            }
        );

        return () => {
            console.log("useNotifications: Unsubscribing from real-time listener.");
            unsubscribe();
        };
    }, [userId]);

    // Function to mark a single notification as read
    const markAsRead = useCallback(async (id) => {
        if (!userId) {
            console.warn("useNotifications: " + MESSAGES.NO_USER_AUTH);
            setError(MESSAGES.NO_USER_AUTH);
            return;
        }
        try {
            const notificationRef = doc(db, 'notifications', id);
            await updateDoc(notificationRef, { read: true });
            console.log(`useNotifications: Notification ${id} marked as read.`);
            setError(null);
        } catch (err) {
            console.error("useNotifications: Error marking single notification as read:", err);
            setError(MESSAGES.MARK_SINGLE_READ_ERROR);
        }
    }, [userId]);

    // Function to mark ALL UNREAD notifications as read
    const markAllAsRead = useCallback(async () => {
        if (!userId) {
            console.warn("useNotifications: " + MESSAGES.NO_USER_AUTH);
            setError(MESSAGES.NO_USER_AUTH);
            return;
        }

        setMarkingAll(true); // Set loading state for this action
        setError(null);

        try {
            const unreadNotificationsQuery = query(
                collection(db, 'notifications'),
                where('recipientId', '==', userId),
                where('read', '==', false) // Only target unread notifications
            );

            const snapshot = await getDocs(unreadNotificationsQuery);
            const batch = writeBatch(db);

            if (snapshot.empty) {
                console.log("useNotifications: No unread notifications to mark as read.");
                setError(null);
                return; // No need to commit if nothing to update
            }

            snapshot.docs.forEach((d) => {
                const notificationRef = doc(db, 'notifications', d.id);
                batch.update(notificationRef, { read: true });
            });

            await batch.commit();
            console.log(`useNotifications: Marked ${snapshot.docs.length} notifications as read for user ${userId}.`);
            setError(null);
        } catch (err) {
            console.error("useNotifications: Error marking all notifications as read:", err);
            setError(MESSAGES.MARK_ALL_READ_ERROR);
        } finally {
            setMarkingAll(false); // Reset loading state
        }
    }, [userId]);


    // Function to clear ALL notifications for the user
    const clearAllNotifications = useCallback(async () => {
        if (!userId) {
            console.warn("useNotifications: " + MESSAGES.NO_USER_AUTH);
            setError(MESSAGES.NO_USER_AUTH);
            return;
        }

        setClearing(true); // Set loading state for this action
        setError(null);

        try {
            const userNotificationsQuery = query(
                collection(db, 'notifications'),
                where('recipientId', '==', userId),
            );

            const snapshot = await getDocs(userNotificationsQuery);
            const batch = writeBatch(db);

            if (snapshot.empty) {
                console.log("useNotifications: No notifications to clear.");
                setError(null);
                return; // No need to commit if nothing to delete
            }

            snapshot.docs.forEach((d) => {
                batch.delete(doc(db, 'notifications', d.id));
            });

            await batch.commit();
            console.log(`useNotifications: Cleared ${snapshot.docs.length} notifications for user ${userId}.`);
            setError(null);
        } catch (err) {
            console.error("useNotifications: Error clearing all notifications:", err);
            setError(MESSAGES.CLEAR_ALL_ERROR);
        } finally {
            setClearing(false); // Reset loading state
        }
    }, [userId]);

    return {
        notifications,
        loading,
        error,
        clearing,
        markingAll, // Export the new loading state
        markAsRead,
        markAllAsRead, // Export the new function
        clearAllNotifications,
        MESSAGES // Export MESSAGES for convenience in components
    };
};

export default useNotifications;