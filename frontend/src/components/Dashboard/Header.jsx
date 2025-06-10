import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Bell, Menu, Loader, XCircle } from 'lucide-react'; // Import Loader and XCircle icons
import PropTypes from 'prop-types';
import styles from './Header.module.css'; // Import the CSS module for professional styling
import { db } from '../../firebase/firestore'; // Your Firebase Firestore instance
import useClickOutside from '../../hooks/useClickOutside'; // Assuming this hook exists and is robust
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,   // For real-time updates
  updateDoc,    // For marking as read
  doc,          // To reference a specific document
  writeBatch,   // For efficient 'clear all' operation
  getDocs,      // To fetch documents for batch deletion
  Timestamp,    // Import Firebase Timestamp type for PropTypes and clarity
} from 'firebase/firestore';

// Centralize common string messages for consistency and easier internationalization
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
  WELCOME_GUEST: "Guest",
};

/**
 * Header component displaying user greeting, sidebar toggle, and real-time notifications.
 * @param {object} props - Component props.
 * @param {function} props.toggleSidebar - Function to toggle the sidebar visibility.
 * @param {object} props.user - Current authenticated user object from AuthContext.
 * @param {string} [props.role='student'] - User's role ('student' or 'admin').
 */
const Header = ({ toggleSidebar, user, role = 'student' }) => {
  // State for notifications and their UI status
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState(null);
  const [clearingNotifications, setClearingNotifications] = useState(false); // State for 'Clear All' button loading

  // Memoized derivation of unread count, re-calculates only when 'notifications' state changes
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  /**
   * Toggles the visibility of the notifications dropdown.
   */
  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  /**
   * Closes the notifications dropdown.
   */
  const closeNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  // Custom hook to detect clicks outside the dropdown, closing it.
  // Ensure 'useClickOutside' is correctly implemented and available in your hooks directory.
  const dropdownRef = useClickOutside(closeNotifications, showNotifications);

  /**
   * Formats a Firestore Timestamp into a user-friendly string.
   * Displays time if today, 'Yesterday', 'Weekday', or full date.
   * @param {firebase.firestore.Timestamp} timestamp - The Firestore Timestamp object.
   * @returns {string} Formatted date/time string (e.g., "10:30 AM", "Yesterday", "Mon", "1/1/2024").
   */
  const formatNotificationTimestamp = useCallback((timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A'; // Handle invalid timestamps gracefully
    const date = timestamp.toDate();
    const now = new Date();

    // Check if the date is today
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();

    // Check if the date is yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() &&
                        date.getMonth() === yesterday.getMonth() &&
                        date.getFullYear() === yesterday.getFullYear();

    // Calculate difference in milliseconds for less than 7 days
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return 'Yesterday';
    } else if (diffTime < sevenDaysInMs) { // Within the last 7 days (excluding today/yesterday)
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString(); // Fallback to standard date format
    }
  }, []); // No dependencies for this pure formatting function

  /**
   * Effect hook to set up a real-time Firestore listener for user-specific notifications.
   * This listener ensures the UI stays updated as notifications are added, read, or deleted.
   * It cleans up the subscription when the component unmounts or 'user.uid' changes.
   */
  useEffect(() => {
    // If no user UID is available, clear notifications and stop loading.
    if (!user?.uid) {
      console.warn("Header: No user UID available for notification listener. Clearing notifications.");
      setNotifications([]);
      setNotificationsLoading(false);
      return; // Exit early if no user to fetch notifications for
    }

    setNotificationsLoading(true);    // Indicate loading has started
    setNotificationsError(null);      // Clear any previous errors
    console.log(`Header: Setting up real-time notification listener for user: ${user.uid}`);

    // Construct the Firestore query
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid), // Filter by current user's ID
      orderBy('timestamp', 'desc'),    // Order by newest first
      limit(20)                        // Limit to a reasonable number for UI performance
    );

    // Subscribe to real-time updates using onSnapshot
    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const fetchedNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(fetchedNotifications);
        setNotificationsLoading(false);      // Loading complete
        setNotificationsError(null);         // Clear any previous errors on successful fetch
        console.log(`Header: Fetched ${fetchedNotifications.length} real-time notifications.`);
      },
      (error) => {
        // Handle errors during the real-time fetch gracefully
        console.error("Header: Error fetching real-time notifications:", error);
        // IMPORTANT: If you encounter "FirebaseError: Missing or insufficient permissions.",
        // it means your Firestore Security Rules are preventing the read operation.
        // Ensure your rules for the 'notifications' collection allow 'read' access
        // based on `request.auth.uid == resource.data.userId`.
        setNotificationsError(MESSAGES.NOTIF_LOAD_ERROR);
        setNotificationsLoading(false);
      }
    );

    // Cleanup function: Unsubscribe from the listener when the component unmounts
    // or when the 'user' dependency changes (e.g., user logs out).
    return () => {
      console.log("Header: Unsubscribing from real-time notification listener.");
      unsubscribe();
    };
  }, [user]); // Effect re-runs only if the 'user' object reference changes (e.g., login/logout)

  /**
   * Marks a specific notification as read in Firestore.
   * UI updates automatically due to the onSnapshot listener.
   * @param {string} id - The Firestore document ID of the notification to mark as read.
   */
  const markAsRead = useCallback(async (id) => {
    if (!user?.uid) {
      console.warn("Header: " + MESSAGES.NO_USER_AUTH);
      return;
    }
    try {
      const notificationRef = doc(db, 'notifications', id);
      await updateDoc(notificationRef, { read: true });
      console.log(`Header: Notification ${id} marked as read.`);
      // Optionally, you might want to close the dropdown after marking as read for better UX:
      // closeNotifications();
    } catch (error) {
      console.error("Header: Error marking notification as read:", error);
      // Optionally provide more specific user feedback (e.g., a temporary toast notification)
      setNotificationsError(MESSAGES.MARK_READ_ERROR);
    }
  }, [user]); // Dependency: user (to ensure authentication context is available)

  /**
   * Clears all notifications for the current user from Firestore.
   * Uses a Firestore batch write for efficiency when deleting multiple documents.
   * IMPORTANT: For applications with potentially thousands of notifications per user,
   * consider implementing this logic as a Cloud Function on the server-side to avoid
   * hitting client-side query limits or excessive reads/writes.
   */
  const clearAllNotifications = useCallback(async () => {
    if (!user?.uid) {
      console.warn("Header: " + MESSAGES.NO_USER_AUTH);
      return;
    }

    setClearingNotifications(true); // Indicate loading for this operation
    setNotificationsError(null);    // Clear any previous errors related to notifications

    try {
      // Create a query to get only the current user's notifications.
      const userNotificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid)
      );

      // Fetch the documents that match the query.
      const snapshot = await getDocs(userNotificationsQuery);
      const batch = writeBatch(db); // Initialize a new batch operation

      // Add delete operations for each notification document to the batch
      snapshot.docs.forEach((d) => {
        batch.delete(doc(db, 'notifications', d.id));
      });

      await batch.commit(); // Commit the batch delete
      console.log(`Header: Cleared ${snapshot.docs.length} notifications for user ${user.uid}.`);
      // UI will automatically update due to the onSnapshot listener.
      closeNotifications(); // Close dropdown after clearing for better UX
    } catch (error) {
      console.error("Header: Error clearing all notifications:", error);
      setNotificationsError(MESSAGES.CLEAR_ALL_ERROR);
    } finally {
      setClearingNotifications(false); // Loading complete, whether successful or not
    }
  }, [user, closeNotifications]); // Dependencies: user and the stable closeNotifications function

  // Determine the display name for the user greeting, with fallbacks for robustness
  const userName =
    user?.displayName?.split(' ')[0] || // First name from displayName
    user?.email?.split('@')[0] ||      // Part before '@' in email
    MESSAGES.WELCOME_GUEST;            // Default 'Guest' if no user info

  // Determine the role title for display
  const roleTitle = role === 'admin' ? 'Admin' : 'Student';


  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerLeft}>
        <button
          className={styles.menuButton}
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className={styles.greeting}>Welcome, {userName}!</h1>
          <p className={styles.roleBadge}>{roleTitle}</p>
        </div>
      </div>

      <div className={styles.notificationsWrapper}>
        <button
          onClick={toggleNotifications}
          className={styles.notificationsButton}
          aria-label={unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "Notifications"}
          aria-expanded={showNotifications}
          aria-controls="notifications-dropdown-menu"
        >
          <Bell size={24} className={styles.bellIcon} />
          {/* Only show badge if there are unread notifications */}
          {unreadCount > 0 && (
            <span className={styles.unreadBadge} aria-live="polite" aria-atomic="true">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div
            ref={dropdownRef}
            className={styles.notificationsDropdown}
            id="notifications-dropdown-menu"
            role="menu" // Indicates this is a menu for accessibility
            aria-labelledby="notifications-button" // Links to the button that opened it
          >
            <div className={styles.dropdownHeader}>
              <h3 className={styles.dropdownTitle}>Notifications</h3>
            </div>

            {/* Conditional rendering for notifications content based on loading/error/data states */}
            {notificationsLoading ? (
              <div className={styles.notificationStatus} role="status">
                <Loader size={20} className={styles.spinner} aria-hidden="true" /> {MESSAGES.LOADING_NOTIFICATIONS}
              </div>
            ) : notificationsError ? (
              <div className={`${styles.notificationStatus} ${styles.errorStatus}`} role="alert">
                <XCircle size={20} className={styles.errorIcon} aria-hidden="true" /> {notificationsError}
              </div>
            ) : notifications.length > 0 ? (
              <ul className={styles.notificationList}>
                {notifications.map(notification => (
                  <li
                    key={notification.id} // Use Firestore doc ID as unique key
                    className={`${styles.notificationItem} ${notification.read
                        ? styles.notificationRead
                        : styles.notificationUnread
                      }`}
                      role="menuitem" // Each list item is a menu item for accessibility
                  >
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                    {/* Display Timestamp if available */}
                    {notification.timestamp && (
                      <span className={styles.notificationTimestamp}>
                        {formatNotificationTimestamp(notification.timestamp)}
                      </span>
                    )}
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className={styles.markReadBtn}
                        aria-label={`Mark notification "${notification.message.substring(0, Math.min(notification.message.length, 50))}..." as read`} // Better aria-label for longer messages
                      >
                        {MESSAGES.MARK_AS_READ}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noNotifications} role="status">{MESSAGES.NO_NEW_NOTIFICATIONS}</p>
            )}

            <div className={styles.clearAllContainer}>
              <button
                onClick={clearAllNotifications}
                className={styles.clearAllBtn}
                // Disable button if no notifications, loading, error, or currently clearing
                disabled={notifications.length === 0 || notificationsLoading || notificationsError || clearingNotifications}
                aria-label={clearingNotifications ? MESSAGES.CLEARING_NOTIFICATIONS : MESSAGES.CLEAR_ALL}
              >
                {clearingNotifications ? (
                  <>
                    <Loader size={16} className={styles.spinner} /> {MESSAGES.CLEARING_NOTIFICATIONS}
                  </>
                ) : (
                  MESSAGES.CLEAR_ALL
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// Define PropTypes for robust prop validation
Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired, // Firebase User ID is crucial for fetching notifications
    displayName: PropTypes.string,
    email: PropTypes.string,
  }),
  role: PropTypes.oneOf(['student', 'admin']), // User's role, restricted to these values
};

export default Header;