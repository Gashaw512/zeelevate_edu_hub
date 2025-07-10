// src/components/common/NotificationDropdown/NotificationDropdown.jsx
import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Loader, MailOpen, BellOff, AlertCircle, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; // Ensure date-fns is installed: npm install date-fns

import styles from './NotificationDropdown.module.css';

// Import the context hook and message constants directly from your context file
import { useNotificationsContext, NOTIFICATION_MESSAGES } from '../../../context/NotificationsContext';

// Assuming these are your common components:
import Toast from '../Toast'; // Make sure your Toast component is robust
import Modal from '../Modal';   // Make sure your Modal component is robust (controlled by `isOpen` prop)

/**
 * @typedef {object} NotificationDropdownProps
 * @property {boolean} isOpen - Controls the visibility of the dropdown.
 * @property {function(): void} onClose - Callback to close the dropdown (passed from parent, e.g., Header).
 */

/**
 * NotificationDropdown Component
 * Displays a list of user notifications, handles actions like marking as read and clearing,
 * with enhanced user feedback via toasts and a confirmation modal.
 * It directly consumes the NotificationsContext for all its data and actions.
 *
 * @param {NotificationDropdownProps} props - The component props.
 * @returns {JSX.Element | null} The JSX element for the notification dropdown, or null if not open.
 */
const NotificationDropdown = ({ isOpen, onClose }) => {
    // Consume all necessary state and actions from the NotificationsContext
    const {
        notifications,
        loading,
        error,
        clearing, // State for 'clearing all' loading
        markingAll, // State for 'marking all as read' loading
        toastMessage, // Toast message state
        requiresConfirmation, // State for modal confirmation
        markAsRead,
        markAllAsRead,
        requestClearAllConfirmation,
        confirmClearAllNotifications,
        requestDeleteConfirmation,
        confirmDeleteNotification,
        cancelConfirmation, // Function to cancel confirmation
    } = useNotificationsContext();

    // Memoized count of unread notifications
    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
    // Memoized boolean to check if there are any notifications
    const hasAnyNotifications = useMemo(() => notifications && notifications.length > 0, [notifications]);

    // Helper function to format Firebase Timestamps
    const formatNotificationTimestamp = useCallback((timestamp) => {
        if (!timestamp || typeof timestamp.toDate !== 'function') {
            // Log a warning in development mode for invalid timestamps
            if (process.env.NODE_ENV === 'development') {
                console.warn("NotificationDropdown: Invalid timestamp object received. Expected Firestore Timestamp with .toDate() method.", timestamp);
            }
            return 'N/A'; // Default display for invalid timestamps
        }
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    }, []);

    // --- Render Logic for Notification List / Status Messages ---
    const renderContent = () => {
        if (loading) {
            return (
                <div className={styles.notificationStatus} role="status" aria-live="polite">
                    <Loader size={20} className={styles.spinner} aria-hidden="true" />
                    <span>{NOTIFICATION_MESSAGES.LOADING_NOTIFICATIONS}</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className={`${styles.notificationStatus} ${styles.errorStatus}`} role="alert" aria-live="assertive">
                    <AlertCircle size={20} className={styles.errorIcon} aria-hidden="true" />
                    <span>{error}</span>
                </div>
            );
        }

        if (!hasAnyNotifications) {
            return (
                <div className={styles.noNotifications} role="status">
                    <BellOff size={48} className={styles.noNotificationsIcon} aria-hidden="true" />
                    <span>{NOTIFICATION_MESSAGES.NO_NEW_NOTIFICATIONS}</span>
                </div>
            );
        }

        return (
            <ul className={styles.notificationList} role="menu" aria-label="Notifications">
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
                        <div className={styles.notificationActions}>
                            {!notification.read && (
                                <button
                                    onClick={() => markAsRead(notification.id)}
                                    className={styles.markReadBtn}
                                    aria-label={`Mark notification as read: ${notification.message.substring(0, Math.min(notification.message.length, 50))}...`}
                                    title="Mark as Read"
                                >
                                    <MailOpen size={18} />
                                </button>
                            )}
                            <button
                                onClick={() => requestDeleteConfirmation(notification.id)}
                                className={styles.deleteBtn}
                                aria-label={`Delete notification: ${notification.message.substring(0, Math.min(notification.message.length, 50))}...`}
                                title="Delete Notification"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    // If the dropdown is not open, render nothing to optimize DOM
    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div
                className={styles.notificationsDropdown}
                id="notifications-dropdown-menu"
                role="dialog" // Role for accessibility as a modal dialog
                aria-modal="true" // Indicates it's a modal dialog
                aria-labelledby="notifications-dropdown-title"
                // No need for local ref here, parent (Header) handles click outside
            >
                <div className={styles.dropdownHeader}>
                    <h3 id="notifications-dropdown-title" className={styles.dropdownTitle}>Notifications</h3>
                    <div className={styles.headerActions}>
                        {hasAnyNotifications && (
                            <button
                                onClick={markAllAsRead}
                                className={styles.headerActionButton}
                                disabled={markingAll || unreadCount === 0} // Disable if no unread or already marking
                                aria-label={markingAll ? NOTIFICATION_MESSAGES.MARKING_ALL_READ : `Mark all ${unreadCount} unread as read`}
                                title="Mark all unread as read"
                            >
                                {markingAll ? (
                                    <Loader size={16} className={styles.spinner} />
                                ) : (
                                    <MailOpen size={16} />
                                )}
                                <span className={styles.buttonText}>
                                    {markingAll ? '' : 'Mark All Read'}
                                </span>
                            </button>
                        )}
                        {hasAnyNotifications && (
                            <button
                                onClick={requestClearAllConfirmation}
                                className={styles.headerActionButton}
                                disabled={clearing} // Disable if already clearing
                                aria-label={clearing ? NOTIFICATION_MESSAGES.CLEARING_NOTIFICATIONS : NOTIFICATION_MESSAGES.CLEAR_ALL}
                                title="Clear All Notifications"
                            >
                                {clearing ? (
                                    <Loader size={16} className={styles.spinner} />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                                <span className={styles.buttonText}>
                                    {clearing ? '' : 'Clear All'}
                                </span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={styles.closeButton}
                            aria-label="Close notifications dropdown"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {renderContent()}

                {hasAnyNotifications && (
                    <div className={styles.viewAllContainer}>
                        <a href="/student/dashboard/notifications" className={styles.viewAllLink} onClick={onClose}>
                            View All Notifications
                        </a>
                    </div>
                )}
            </div>

            {/* --- Toast Component --- */}
            {/* The Toast component itself should handle its display/hide logic based on its props or internal state */}
            {toastMessage && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                    // No onClose prop needed here, as useNotifications hook clears it.
                />
            )}

            {/* --- Confirmation Modal for Clear All Notifications --- */}
            {/* The Modal is only rendered if requiresConfirmation is set for 'clearAll' */}
            {requiresConfirmation && requiresConfirmation.type === 'clearAll' && (
                <Modal
                    isOpen={true} // Always true when this conditional rendering is met
                    title="Confirm Clear All Notifications"
                    message={NOTIFICATION_MESSAGES.CONFIRM_CLEAR_ALL}
                    onConfirm={confirmClearAllNotifications}
                    onCancel={cancelConfirmation}
                    confirmText={NOTIFICATION_MESSAGES.CLEAR_ALL}
                    cancelText="Cancel"
                />
            )}

            {/* --- Confirmation Modal for Delete Single Notification --- */}
            {/* The Modal is only rendered if requiresConfirmation is set for 'deleteSingle' */}
            {requiresConfirmation && requiresConfirmation.type === 'deleteSingle' && (
                <Modal
                    isOpen={true} // Always true when this conditional rendering is met
                    title="Confirm Delete Notification"
                    message={NOTIFICATION_MESSAGES.CONFIRM_DELETE_SINGLE}
                    onConfirm={confirmDeleteNotification}
                    onCancel={cancelConfirmation}
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            )}
        </>
    );
};

NotificationDropdown.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default NotificationDropdown;