// Header.jsx
import { useState, useCallback, useMemo } from 'react';
import { Bell, Menu, Loader, XCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import styles from './Header.module.css';
import useClickOutside from '../../hooks/useClickOutside';
import useNotifications from '../../hooks/useNotifications'; // New hook import

const Header = ({ toggleSidebar, user, role = 'student' }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
    clearing: clearingNotifications,
    markAsRead,
    clearAllNotifications,
    MESSAGES // Access messages from the hook
  } = useNotifications(user?.uid); // Pass user UID to the hook

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const closeNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const dropdownRef = useClickOutside(closeNotifications, showNotifications);

  // --- CHANGE START ---
  // Modify formatNotificationTimestamp to parse a string date
  const formatNotificationTimestamp = useCallback((timestampString) => {
    if (!timestampString) return 'N/A'; // It's now a string, not an object with .toDate()
    const date = new Date(timestampString); // Parse the ISO 8601 string into a Date object
    const now = new Date();

    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

    const diffTime = Math.abs(now.getTime() - date.getTime());
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    if (isNaN(date.getTime())) { // Check if date parsing was successful
      return 'Invalid Date';
    }

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return 'Yesterday';
    } else if (diffTime < sevenDaysInMs) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString();
    }
  }, []);
  // --- CHANGE END ---


  const userName =
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    MESSAGES.WELCOME_GUEST; // Use MESSAGE from hook for consistency

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
            role="menu"
            aria-labelledby="notifications-button"
          >
            <div className={styles.dropdownHeader}>
              <h3 className={styles.dropdownTitle}>Notifications</h3>
            </div>

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
                    key={notification.id}
                    className={`${styles.notificationItem} ${notification.read ? styles.notificationRead : styles.notificationUnread}`}
                    role="menuitem"
                  >
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                    {/* --- CHANGE START --- */}
                    {/* Use notification.createdAt here */}
                    {notification.createdAt && (
                      <span className={styles.notificationTimestamp}>
                        {formatNotificationTimestamp(notification.createdAt)}
                      </span>
                    )}
                    {/* --- CHANGE END --- */}
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className={styles.markReadBtn}
                        aria-label={`Mark notification "${notification.message.substring(0, Math.min(notification.message.length, 50))}..." as read`}
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

Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    email: PropTypes.string,
  }),
  role: PropTypes.oneOf(['student', 'admin']),
};

export default Header;