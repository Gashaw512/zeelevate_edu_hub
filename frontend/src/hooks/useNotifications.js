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
import { db } from '../firebase/firestore';

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

const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [requiresConfirmation, setRequiresConfirmation] = useState(null);
  const [notificationToDeleteId, setNotificationToDeleteId] = useState(null);

  // Auto-clear toast after 5 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Subscribe to notifications real-time updates
  useEffect(() => {
    if (!userId) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("useNotifications: No user ID available for notification listener. Clearing notifications.");
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
      limit(20)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("useNotifications: Error fetching notifications:", err);
        setError(NOTIFICATION_MESSAGES.NOTIF_LOAD_ERROR);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const markAsRead = useCallback(async (id) => {
    if (!userId) {
      setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
      return;
    }
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
      setError(null);
    } catch (err) {
      console.error("useNotifications: Error marking single notification as read:", err);
      setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.MARK_SINGLE_READ_ERROR });
    }
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) {
      setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
      return;
    }
    setMarkingAll(true);
    setError(null);
    setToastMessage(null);

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

  const requestClearAllConfirmation = useCallback(() => {
    if (!userId) {
      setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
      return;
    }
    setRequiresConfirmation({ type: 'clearAll' });
    setNotificationToDeleteId(null);
  }, [userId]);

  const confirmClearAllNotifications = useCallback(async () => {
    if (!userId) {
      setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
      return;
    }
    setClearing(true);
    setError(null);
    setToastMessage(null);
    setRequiresConfirmation(null);

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

  const requestDeleteConfirmation = useCallback((notificationId) => {
    if (!userId) {
      setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
      return;
    }
    setNotificationToDeleteId(notificationId);
    setRequiresConfirmation({ type: 'deleteSingle', id: notificationId });
  }, [userId]);

  const confirmDeleteNotification = useCallback(async () => {
    if (!userId) {
      setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.NO_USER_AUTH });
      return;
    }
    if (!notificationToDeleteId) {
      console.warn("useNotifications: No notification ID set for deletion confirmation.");
      return;
    }

    setError(null);
    setToastMessage(null);
    setRequiresConfirmation(null);

    try {
      await deleteDoc(doc(db, 'notifications', notificationToDeleteId));
      setToastMessage({ type: 'success', message: NOTIFICATION_MESSAGES.DELETE_SINGLE_SUCCESS });
    } catch (err) {
      console.error("useNotifications: Error deleting notification:", err);
      setToastMessage({ type: 'error', message: NOTIFICATION_MESSAGES.DELETE_SINGLE_ERROR });
    } finally {
      setNotificationToDeleteId(null);
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
    NOTIFICATION_MESSAGES,
  };
};

export default useNotifications;
