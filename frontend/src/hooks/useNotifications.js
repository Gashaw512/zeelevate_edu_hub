// hooks/useNotifications.js
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
} from 'firebase/firestore';
import { db } from '../firebase/firestore'; // Adjust path as needed

const MESSAGES = {
  NO_USER_AUTH: "Cannot perform action: User not authenticated.",
  NOTIF_LOAD_ERROR: "Failed to load notifications. Please check your connection or permissions.",
  CLEAR_ALL_ERROR: "Failed to clear all notifications. Please try again.",
  MARK_READ_ERROR: "Failed to mark notification as read. Please try again.",
  LOADING_NOTIFICATIONS: "Loading notifications...",
  NO_NEW_NOTIFICATIONS: "No new notifications.",
  CLEARING_NOTIFICATIONS: "Clearing...",
  CLEAR_ALL: "Clear All",
  MARK_AS_READ: "Mark as Read",
};

const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!userId) {
      console.warn("useNotifications: No user ID available for notification listener. Clearing notifications.");
      setNotifications([]);
      setLoading(false);
      // Ensure any previous error is cleared if user logs out or id becomes null
      setError(null);
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors on new listener setup
    console.log(`useNotifications: Setting up real-time listener for user: ${userId}`);

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId), // *** CORRECTED THIS LINE ***
      orderBy('timestamp', 'desc'),
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
        setError(null); // Clear error on successful fetch
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
  }, [userId]); // Dependency array: re-run effect if userId changes

  const markAsRead = useCallback(async (id) => {
    if (!userId) {
      console.warn("useNotifications: " + MESSAGES.NO_USER_AUTH);
      setError(MESSAGES.NO_USER_AUTH); // Set error for UI feedback
      return;
    }
    try {
      const notificationRef = doc(db, 'notifications', id);
      await updateDoc(notificationRef, { read: true });
      console.log(`useNotifications: Notification ${id} marked as read.`);
      setError(null); // Clear any previous error
    } catch (err) {
      console.error("useNotifications: Error marking notification as read:", err);
      setError(MESSAGES.MARK_READ_ERROR);
    }
  }, [userId]); // Dependency array: depends on userId

  const clearAllNotifications = useCallback(async () => {
    if (!userId) {
      console.warn("useNotifications: " + MESSAGES.NO_USER_AUTH);
      setError(MESSAGES.NO_USER_AUTH); // Set error for UI feedback
      return;
    }

    setClearing(true);
    setError(null); // Clear previous errors

    try {
      // This query is already correct with 'recipientId'
      const userNotificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
      );

      const snapshot = await getDocs(userNotificationsQuery);
      const batch = writeBatch(db);

      snapshot.docs.forEach((d) => {
        batch.delete(doc(db, 'notifications', d.id));
      });

      await batch.commit();
      console.log(`useNotifications: Cleared ${snapshot.docs.length} notifications for user ${userId}.`);
      setError(null); // Clear error on successful clear
    } catch (err) {
      console.error("useNotifications: Error clearing all notifications:", err);
      setError(MESSAGES.CLEAR_ALL_ERROR);
    } finally {
      setClearing(false);
    }
  }, [userId]); // Dependency array: depends on userId

  return {
    notifications,
    loading,
    error,
    clearing,
    markAsRead,
    clearAllNotifications,
    MESSAGES
  };
};

export default useNotifications;