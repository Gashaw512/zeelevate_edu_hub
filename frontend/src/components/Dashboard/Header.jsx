import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Menu, Loader } from 'lucide-react'; // Import Loader icon for loading state
import PropTypes from 'prop-types';
import styles from './Header.module.css'; // Import the new CSS module
import { db } from '../../firebase/firestore'; // Your Firebase Firestore instance
import useClickOutside from '../../hooks/useClickOutside'; // Assuming this hook exists
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot, // For real-time updates
  updateDoc,  // For marking as read
  doc,        // To reference a specific document
  writeBatch, // For efficient 'clear all' operation
} from 'firebase/firestore';

const Header = ({ toggleSidebar, user, role = 'student' }) => {
  // State for notifications and their UI status
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState(null);

  // Derive unread count from the state
  const unreadCount = notifications.filter(n => !n.read).length;

  /**
   * Toggles the visibility of the notifications dropdown.
   * Uses useCallback for memoization, preventing unnecessary re-renders.
   */
  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
    // Optionally, if dropdown is opened, you might want to mark all currently visible as read
    // or fetch more if using pagination. For simplicity, we just toggle visibility.
  }, []);

  const closeNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const dropdownRef = useClickOutside(closeNotifications, showNotifications);

  /**
   * Helper function to format Firestore Timestamps
   * @param {firebase.firestore.Timestamp} timestamp
   * @returns {string} Formatted date string
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    const date = timestamp.toDate();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString();
    }
  };


  /**
   * Effect hook to set up a real-time Firestore listener for user-specific notifications.
   * This runs when the component mounts and cleans up when it unmounts.
   * It re-runs if the 'user' object (specifically user.uid) changes.
   */
  useEffect(() => {
    // Only set up listener if user is authenticated and has a UID
    if (!user?.uid) {
      setNotifications([]);
      setNotificationsLoading(false);
      return; // Exit early if no user to fetch notifications for
    }

    setNotificationsLoading(true);
    setNotificationsError(null);

    // Create a Firestore query:
    // 1. Reference the 'notifications' collection.
    // 2. Filter by 'userId' to get only current user's notifications.
    // 3. Order by 'timestamp' (descending) to get newest first.
    // 4. Limit to, say, the 10 most recent notifications for performance.
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid), // IMPORTANT: Ensure 'userId' field in Firestore docs
      orderBy('timestamp', 'desc'),
      limit(10) // Limit to latest 10 for performance and UI
    );

    // Set up the real-time listener (onSnapshot)
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedNotifications = snapshot.docs.map(doc => ({
          id: doc.id, // Firestore document ID
          ...doc.data(), // All other fields (message, read, timestamp, etc.)
        }));
        setNotifications(fetchedNotifications);
        setNotificationsLoading(false);
      },
      (error) => {
        // Handle errors during the real-time fetch
        console.error("Error fetching real-time notifications:", error);
        setNotificationsError("Failed to load notifications. Please try again.");
        setNotificationsLoading(false);
      }
    );

    // Cleanup function: Unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, [user]); // Re-run this effect if the 'user' object changes (e.g., login/logout)

  /**
   * Marks a specific notification as read in Firestore.
   * Uses useCallback for memoization.
   * @param {string} id - The Firestore document ID of the notification.
   */
  const markAsRead = useCallback(async (id) => {
    if (!user?.uid) {
      console.warn("Cannot mark as read: User not authenticated.");
      return;
    }
    try {
      // Get a reference to the specific notification document
      const notificationRef = doc(db, 'notifications', id);
      // Update the 'read' field to true
      await updateDoc(notificationRef, {
        read: true,
      });
      // UI will automatically update due to onSnapshot listener
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Optionally show an error message to the user
    }
  }, [user]);

  /**
   * Clears all notifications for the current user from Firestore.
   * Uses a Firestore batch write for efficiency.
   * Uses useCallback for memoization.
   */
  const clearAllNotifications = useCallback(async () => {
    if (!user?.uid) {
      console.warn("Cannot clear all notifications: User not authenticated.");
      return;
    }
    // Only clear notifications that belong to the current user
    const userNotificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    try {
      // Fetch the documents to delete. It's crucial to get a snapshot *before* deleting.
      const snapshot = await (await userNotificationsQuery.get());
      const batch = writeBatch(db); // Create a new batch

      // Add delete operations for each notification document to the batch
      snapshot.docs.forEach((d) => {
        batch.delete(doc(db, 'notifications', d.id));
      });

      await batch.commit(); // Commit the batch delete
      // UI will automatically update due to onSnapshot listener
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      // Optionally show an error message to the user
    }
  }, [user]);


  // Determine the display name for the user greeting
  const userName =
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Guest'; // Fallback to 'Guest' if no user info
    const roleTitle = role === 'admin' ? 'Admin' : 'Student'; // Assuming 'role' can be 'admin' or 'student'


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

            {/* Conditional rendering for notifications content */}
            {notificationsLoading ? (
              <div className={styles.notificationStatus} role="status">
                <Loader size={20} className={styles.spinner} aria-hidden="true" /> Loading notifications...
              </div>
            ) : notificationsError ? (
              <div className={`${styles.notificationStatus} ${styles.errorStatus}`} role="alert">
                {notificationsError}
              </div>
            ) : notifications.length > 0 ? (
              <ul className={styles.notificationList}>
                {notifications.map(notification => (
                  <li
                    key={notification.id} // Use Firestore doc ID as key
                    className={`${styles.notificationItem} ${notification.read
                        ? styles.notificationRead
                        : styles.notificationUnread
                      }`}
                      role="menuitem" // Each list item is a menu item
                  >
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                    {/* Display Timestamp */}
                    {notification.timestamp && (
                      <span className={styles.notificationTimestamp}>
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    )}
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className={styles.markReadBtn}
                        aria-label={`Mark notification "${notification.message.substring(0, 30)}..." as read`}
                      >
                        Mark as Read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noNotifications} role="status">No new notifications.</p>
            )}

            <div className={styles.clearAllContainer}>
              <button
                onClick={clearAllNotifications}
                className={styles.clearAllBtn}
                disabled={notifications.length === 0 || notificationsLoading || notificationsError}
                aria-label="Clear all notifications"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  // User object structure from Firebase Auth (or your custom user object)
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired, // Firebase User ID is crucial
    displayName: PropTypes.string,
    email: PropTypes.string,
  }),
  role: PropTypes.oneOf(['student', 'admin']), // Optional role prop
};

export default Header;