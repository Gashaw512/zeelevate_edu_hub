import { useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loader, MailOpen, BellOff, AlertCircle, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import styles from './NotificationDropdown.module.css';

import { useNotificationsContext, NOTIFICATION_MESSAGES } from '../../../context/NotificationsContext';


import Toast from '../Toast'; 
import Modal from '../Modal'; 


/**
 * @typedef {object} NotificationDropdownProps
 * @property {string} userId - The ID of the current user.
 * @property {boolean} isOpen - Controls the visibility of the dropdown.
 * @property {function(): void} onClose - Callback to close the dropdown.
 */

/**
 * NotificationDropdown Component
 * Displays a list of user notifications, handles actions like marking as read and clearing,
 * with enhanced user feedback via toasts and a confirmation modal.
 *
 * @param {NotificationDropdownProps} props - The component props.
 * @returns {JSX.Element} The JSX element for the notification dropdown.
 */


const NotificationDropdown = ({ isOpen, onClose }) => {
    // We'll use the useNotificationsContext hook here directly
    const {
        notifications,
        loading,
        error,
        clearing,
        markingAll,
        toastMessage,
        requiresConfirmation,
        // notificationToDeleteId, // Not directly used in JSX, but managed by the hook
        markAsRead,
        markAllAsRead,
        requestClearAllConfirmation,
        confirmClearAllNotifications,
        requestDeleteConfirmation,
        confirmDeleteNotification,
        cancelConfirmation,
    } = useNotificationsContext(); // No userId prop needed here anymore

    const dropdownRef = useRef(null); // Ref for click outside detection

    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
    const hasAnyNotifications = useMemo(() => notifications && notifications.length > 0, [notifications]);

    // Handle closing dropdown on outside click
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen, onClose]);

    // Handle timestamp formatting for display
    const formatNotificationTimestamp = useCallback((timestamp) => {
        if (!timestamp || typeof timestamp.toDate !== 'function') {
            console.warn("NotificationDropdown: Invalid timestamp object received. Expected Firestore Timestamp with .toDate() method.", timestamp);
            return 'N/A';
        }
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    }, []);

    // --- Render Logic for Notification List / Status ---
    const renderContent = () => {
        if (loading) {
            return (
                <div className={styles.notificationStatus} role="status" aria-live="polite">
                    <Loader size={20} className={styles.spinner} aria-hidden="true" /> {NOTIFICATION_MESSAGES.LOADING_NOTIFICATIONS}
                </div>
            );
        }

        if (error) {
            return (
                <div className={`${styles.notificationStatus} ${styles.errorStatus}`} role="alert" aria-live="assertive">
                    <AlertCircle size={20} className={styles.errorIcon} aria-hidden="true" /> {error}
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
            <ul className={styles.notificationList} role="menu">
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
                                    aria-label={`Mark notification "${notification.message.substring(0, Math.min(notification.message.length, 50))}..." as read`}
                                    title="Mark as Read"
                                >
                                    <MailOpen size={18} />
                                </button>
                            )}
                            <button
                                onClick={() => requestDeleteConfirmation(notification.id)}
                                className={styles.deleteBtn}
                                aria-label={`Delete notification "${notification.message.substring(0, Math.min(notification.message.length, 50))}..."`}
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

    // If dropdown is not open, don't render anything
    if (!isOpen) return null;

    return (
        <>
            <div
                ref={dropdownRef}
                className={styles.notificationsDropdown}
                id="notifications-dropdown-menu"
                role="dialog"
                aria-modal="true"
                aria-labelledby="notifications-dropdown-title"
            >
                <div className={styles.dropdownHeader}>
                    <h3 id="notifications-dropdown-title" className={styles.dropdownTitle}>Notifications</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {hasAnyNotifications && (
                            <button
                                onClick={markAllAsRead}
                                className={styles.headerActionButton}
                                disabled={markingAll || unreadCount === 0}
                                aria-label={markingAll ? NOTIFICATION_MESSAGES.MARKING_ALL_READ : `Mark all ${unreadCount} unread as read`}
                                title="Mark all unread as read"
                            >
                                {markingAll ? (
                                    <>
                                        <Loader size={16} className={styles.spinner} /> {NOTIFICATION_MESSAGES.MARKING_ALL_READ}
                                    </>
                                ) : (
                                    <>
                                        <MailOpen size={16} /> Mark All Read
                                    </>
                                )}
                            </button>
                        )}
                        {hasAnyNotifications && (
                            <button
                                onClick={requestClearAllConfirmation}
                                className={styles.headerActionButton}
                                disabled={clearing}
                                aria-label={clearing ? NOTIFICATION_MESSAGES.CLEARING_NOTIFICATIONS : NOTIFICATION_MESSAGES.CLEAR_ALL}
                                title="Clear All Notifications"
                            >
                                {clearing ? (
                                    <>
                                        <Loader size={16} className={styles.spinner} /> {NOTIFICATION_MESSAGES.CLEARING_NOTIFICATIONS}
                                    </>
                                ) : (
                                    <>Clear All</>
                                )}
                            </button>
                        )}
                        <button onClick={onClose} className={styles.closeButton} aria-label="Close notifications">
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
            {toastMessage && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                    // The useNotifications hook handles clearing the toast automatically.
                    // If your Toast component has an internal close button, it should manage its own state.
                />
            )}

            {/* --- Confirmation Modal Component for Clear All --- */}
            {/* Only show modal if confirmation is required AND there are notifications */}
            {requiresConfirmation && requiresConfirmation.type === 'clearAll' && hasAnyNotifications && (
                <Modal
                    title="Confirm Clear All Notifications"
                    message={NOTIFICATION_MESSAGES.CONFIRM_CLEAR_ALL}
                    onConfirm={confirmClearAllNotifications}
                    onCancel={cancelConfirmation}
                    confirmText="Clear Notifications"
                    cancelText="Cancel"
                />
            )}

            {/* --- NEW: Confirmation Modal Component for Delete Single --- */}
            {/* Only show modal if confirmation is required AND there are notifications */}
            {requiresConfirmation && requiresConfirmation.type === 'deleteSingle' && hasAnyNotifications && (
                <Modal
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