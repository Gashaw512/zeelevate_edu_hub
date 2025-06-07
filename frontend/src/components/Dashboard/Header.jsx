import { useState, useCallback } from 'react';
import { Bell, Menu } from 'lucide-react';
import PropTypes from 'prop-types';
import styles from './Header.module.css';

const mockNotifications = [
  { id: '1', message: 'New course enrollment request', read: false },
  { id: '2', message: 'System maintenance scheduled', read: false },
  { id: '3', message: 'New student registration', read: true },
  { id: '4', message: 'Course update completed', read: false },
];

const Header = ({ toggleSidebar, user, role = 'student' }) => {
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

  const userName = user?.displayName?.split(' ')[0] || 
                  user?.name?.split(' ')[0] || 
                  user?.email?.split('@')[0] || 
                  'Guest';

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
  role: PropTypes.oneOf(['student', 'admin']),
};

export default Header;