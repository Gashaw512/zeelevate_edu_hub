// src/services/notificationsService.js
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot, // Real-time listener still uses onSnapshot
    updateDoc,
    doc,
    writeBatch,
    getDocs,
    deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Sets up a real-time listener for user notifications.
 * @param {string} userId - The ID of the recipient user.
 * @param {function(Array<object>): void} onNotificationsFetched - Callback to handle fetched notifications.
 * @param {function(Error): void} onError - Callback to handle errors.
 * @returns {function(): void} An unsubscribe function to stop the listener.
 */
export const listenToNotifications = (userId, onNotificationsFetched, onError) => {
    if (!userId) {
        console.warn("listenToNotifications: userId is undefined. No listener will be set.");
        onNotificationsFetched([]); // Pass empty array if no user
        return () => {}; // Return a no-op unsubscribe
    }

    const notificationsQuery = query(
        collection(db, NOTIFICATIONS_COLLECTION),
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
            onNotificationsFetched(fetchedNotifications);
        },
        (err) => {
            console.error("notificationsService: Error in real-time listener:", err);
            onError(new Error("Failed to load notifications. Please try again."));
        }
    );

    return unsubscribe;
};

/**
 * Marks a single notification as read in Firestore.
 * @param {string} notificationId - The ID of the notification to mark as read.
 * @returns {Promise<void>}
 */
export const markNotificationAsReadInFirestore = async (notificationId) => {
    try {
        const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
        await updateDoc(notificationRef, { read: true });
        console.log(`notificationsService: Notification ${notificationId} marked as read.`);
    } catch (error) {
        console.error("notificationsService: Error marking single notification as read:", error);
        throw new Error("Failed to mark notification as read.");
    }
};

/**
 * Marks all unread notifications for a user as read using a batch write.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<number>} The number of notifications marked as read.
 */
export const markAllNotificationsAsReadInFirestore = async (userId) => {
    try {
        const unreadNotificationsQuery = query(
            collection(db, NOTIFICATIONS_COLLECTION),
            where('recipientId', '==', userId),
            where('read', '==', false)
        );

        const snapshot = await getDocs(unreadNotificationsQuery);
        const batch = writeBatch(db);

        if (snapshot.empty) {
            console.log("notificationsService: No unread notifications to mark as read.");
            return 0; // Return 0 if no unread notifications
        }

        snapshot.docs.forEach((d) => {
            const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, d.id);
            batch.update(notificationRef, { read: true });
        });

        await batch.commit();
        console.log(`notificationsService: Marked ${snapshot.docs.length} notifications as read for user ${userId}.`);
        return snapshot.docs.length;
    } catch (error) {
        console.error("notificationsService: Error marking all notifications as read:", error);
        throw new Error("Failed to mark all notifications as read.");
    }
};

/**
 * Deletes a single notification from Firestore.
 * @param {string} notificationId - The ID of the notification to delete.
 * @returns {Promise<void>}
 */
export const deleteNotificationFromFirestore = async (notificationId) => {
    try {
        const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
        await deleteDoc(notificationRef);
        console.log(`notificationsService: Notification ${notificationId} deleted.`);
    } catch (error) {
        console.error("notificationsService: Error deleting single notification:", error);
        throw new Error("Failed to delete notification.");
    }
};

/**
 * Clears (deletes) all notifications for a user using a batch write.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<number>} The number of notifications cleared.
 */
export const clearAllNotificationsInFirestore = async (userId) => {
    try {
        const userNotificationsQuery = query(
            collection(db, NOTIFICATIONS_COLLECTION),
            where('recipientId', '==', userId),
        );

        const snapshot = await getDocs(userNotificationsQuery);
        const batch = writeBatch(db);

        if (snapshot.empty) {
            console.log("notificationsService: No notifications to clear.");
            return 0; // Return 0 if no notifications
        }

        snapshot.docs.forEach((d) => {
            batch.delete(doc(db, NOTIFICATIONS_COLLECTION, d.id));
        });

        await batch.commit();
        console.log(`notificationsService: Cleared ${snapshot.docs.length} notifications for user ${userId}.`);
        return snapshot.docs.length;
    } catch (error) {
        console.error("notificationsService: Error clearing all notifications:", error);
        throw new Error("Failed to clear all notifications.");
    }
};