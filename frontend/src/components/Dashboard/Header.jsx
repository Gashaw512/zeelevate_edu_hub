import { useState, useCallback, useMemo } from 'react';
import { Bell, Menu } from 'lucide-react';
import PropTypes from 'prop-types';
import styles from './Header.module.css';
import useClickOutside from '../../hooks/useClickOutside';
// Import only the useNotifications hook for unreadCount here if desired,
// otherwise the NotificationDropdown will handle its own hook instance.
import useNotifications from '../../hooks/useNotifications';
import NotificationDropdown from '../common/NotificationDropdown/NotificationDropdown';
import { NOTIFICATION_MESSAGES } from '../../hooks/useNotifications'; // Import messages for general use


const Header = ({ toggleSidebar, user, role = 'student' }) => {
    const [showNotifications, setShowNotifications] = useState(false);

    // Only get the unread count here if you need it for the badge
    // The NotificationDropdown will create its own instance of useNotifications
    const { notifications } = useNotifications(user?.uid);

    const unreadCount = useMemo(() =>
        notifications ? notifications.filter(n => !n.read).length : 0,
        [notifications]
    );

    const toggleNotifications = useCallback(() => {
        setShowNotifications(prev => !prev);
    }, []);

    const closeNotifications = useCallback(() => {
        setShowNotifications(false);
    }, []);

    // Use a custom hook for click outside detection
    const dropdownRef = useClickOutside(closeNotifications, showNotifications);

    const userName =
        user?.displayName?.split(' ')[0] ||
        user?.email?.split('@')[0] ||
        "Guest"; // Directly use "Guest" or import it if it's a global constant.
                 // NOTIFICATION_MESSAGES.WELCOME_GUEST was not defined in the provided hook.

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
                    <NotificationDropdown
                        userId={user?.uid} // Pass the userId down
                        isOpen={showNotifications} // Pass isOpen state
                        onClose={closeNotifications} // Pass the close handler
                        // No need to pass notifications, loading, error, etc. anymore!
                        // The NotificationDropdown uses its own instance of useNotifications.
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