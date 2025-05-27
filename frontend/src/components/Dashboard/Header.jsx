import React, { useState, useCallback } from 'react';
import { Bell, Menu } from 'lucide-react';
import PropTypes from 'prop-types';
import styles from './Header.module.css';  // Import CSS module

const mockNotifications = [
  { id: '1', message: 'Your report for May is ready.', read: false },
  { id: '2', message: 'New message from John Doe.', read: false },
  { id: '3', message: 'Meeting reminder: Project Sync at 2 PM.', read: true },
  { id: '4', message: 'System update completed successfully.', read: false },
  { id: '5', message: 'Your subscription is expiring soon.', read: false },
  { id: '6', message: 'New task assigned: Review Q3 budget.', read: false },
  { id: '7', message: 'Payment received from Client A.', read: true },
  { id: '8', message: 'Security alert: Unusual login activity.', read: false },
];

const Header = ({ toggleSidebar, user }) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const userName =
    user?.displayName?.split(' ')[0] ||
    user?.name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Guest';

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
        <h1 className={styles.greeting}>Welcome, {userName}!</h1>
      </div>

      <div className={styles.notificationsWrapper}>
        <button
          onClick={toggleNotifications}
          className={styles.notificationsButton}
          aria-label="Notifications"
        >
          <Bell size={24} className={styles.bellIcon} />
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount}</span>
          )}
        </button>

        {showNotifications && (
          <div className={styles.notificationsDropdown}>
            <div className={styles.dropdownHeader}>
              <h3 className={styles.dropdownTitle}>Notifications</h3>
            </div>
            {notifications.length > 0 ? (
              <ul className={styles.notificationList}>
                {notifications.map(notification => (
                  <li
                    key={notification.id}
                    className={`${styles.notificationItem} ${
                      notification.read
                        ? styles.notificationRead
                        : styles.notificationUnread
                    }`}
                  >
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className={styles.markReadBtn}
                      >
                        Mark as Read
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noNotifications}>No new notifications.</p>
            )}
            <div className={styles.clearAllContainer}>
              <button
                onClick={clearAllNotifications}
                className={styles.clearAllBtn}
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
  user: PropTypes.object,
};

export default Header;
