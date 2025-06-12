// Header.jsx
import { useState, useCallback, useMemo } from 'react';
import { Bell, Menu, Loader, XCircle } from 'lucide-react';
import PropTypes from 'prop-types';
import styles from './Header.module.css';
import useClickOutside from '../../hooks/useClickOutside';
import useNotifications from '../../hooks/useNotifications';

const Header = ({ toggleSidebar, user, role = 'student' }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
    clearing: clearingNotifications,
    markAsRead,
    clearAllNotifications,
    MESSAGES
  } = useNotifications(user?.uid);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const closeNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const dropdownRef = useClickOutside(closeNotifications, showNotifications);

  const formatNotificationTimestamp = useCallback((timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
      console.warn("Header: Invalid timestamp object received. Expected Firestore Timestamp with .toDate() method.", timestamp);
      return 'N/A';
    }

    const date = timestamp.toDate();
    const now = new Date();

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(date, now)) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  const userName =
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    MESSAGES.WELCOME_GUEST;

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
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className={styles.clearAllBtn}
                  disabled={notificationsLoading || notificationsError || clearingNotifications}
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
              )}
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
                    <div className={styles.notificationContent}>
                      <p className={styles.notificationMessage}>
                        {notification.message}
                      </p>
                      {notification.createdAt && (
                        <span className={styles.notificationTimestamp}>
                          {formatNotificationTimestamp(notification.createdAt)}
                        </span>
                      )}
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className={styles.markReadBtn}
                        aria-label={`Mark notification "${notification.message.substring(0, Math.min(notification.message.length, 50))}..." as read`}
                        title="Mark as Read"
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