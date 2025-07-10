// src/components/Layout/Header.jsx
import { useState, useCallback, useMemo } from 'react';
import { Bell, Menu } from 'lucide-react';
import PropTypes from 'prop-types';
import styles from './Header.module.css';

// Import useClickOutside hook (if you still use it)
import useClickOutside from '../../hooks/useClickOutside';

// Import the NotificationsContext hook directly
import { useNotificationsContext } from '../../context/NotificationsContext';

// Import the NotificationDropdown component
import NotificationDropdown from '../common/NotificationDropdown/NotificationDropdown';

const Header = ({ toggleSidebar, user, role = 'student' }) => {
    const [showNotifications, setShowNotifications] = useState(false);

    // --- CRITICAL CHANGE: Use useNotificationsContext for notification data ---
    // Get notifications and loading status from the shared context.
    const { notifications, loading: notificationsLoading } = useNotificationsContext();
    // --- END CRITICAL CHANGE ---

    // Calculate unread count based on the shared notifications state
    const unreadCount = useMemo(() => {
        // Only calculate if notifications are loaded and available
        if (notificationsLoading || !notifications) {
            return 0; // Or a placeholder if you want to indicate loading
        }
        return notifications.filter(n => !n.read).length;
    }, [notifications, notificationsLoading]);

    const toggleNotifications = useCallback(() => {
        setShowNotifications(prev => !prev);
    }, []);

    const closeNotifications = useCallback(() => {
        setShowNotifications(false);
    }, []);

    // Use useClickOutside to close the notification dropdown when clicking elsewhere
    const dropdownRef = useClickOutside(closeNotifications, showNotifications);

    const userName =
        user?.displayName?.split(' ')[0] ||
        user?.email?.split('@')[0] ||
        "Guest";

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

            <div className={styles.notificationsWrapper} ref={dropdownRef}> {/* Attach ref here */}
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

                {/* NotificationDropdown should only render when showNotifications is true */}
                {/* It will now get all its data from the context, so no userId prop is needed */}
                {showNotifications && (
                    <NotificationDropdown
                        isOpen={showNotifications}
                        onClose={closeNotifications}
                    />
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