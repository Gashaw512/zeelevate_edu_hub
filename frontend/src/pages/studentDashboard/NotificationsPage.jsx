// src/components/NotificationsPage/NotificationsPage.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import useNotifications from '../../hooks/useNotifications';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDistanceToNow, parseISO } from 'date-fns'; // parseISO is no longer strictly needed for timestamps, but kept if you have other date strings

// Icons
import { Bell, MailOpen, Trash2, XCircle, Loader2 } from 'lucide-react';

// CSS Modules
import styles from './NotificationsPage.module.css';

const NotificationsPage = () => {
    const { user, loading: authLoading } = useAuth();
    const {
        notifications,
        loading: notificationsLoading,
        error: notificationsError,
        markAsRead, // Matches the updated hook function name
        markAllAsRead, // Matches the updated hook function name
        deleteNotification, // Needs to be implemented in your hook if not already
        clearAllNotifications,
        markingAll, // State for "Mark All as Read" loading directly from the hook
        clearing,   // State for "Clear All" loading directly from the hook
        MESSAGES    // Messages object from the hook for consistency
    } = useNotifications(user?.uid);

    const [filter, setFilter] = useState('all'); // 'all' or 'unread'

    // Filtered notifications based on selected filter
    const filteredNotifications = useMemo(() => {
        if (!notifications) return [];
        if (filter === 'unread') {
            return notifications.filter(n => !n.read);
        }
        return notifications;
    }, [notifications, filter]);

    // Handle individual notification actions
    const handleMarkAsRead = useCallback(async (notificationId) => {
        await markAsRead(notificationId);
    }, [markAsRead]);

    const handleDeleteNotification = useCallback(async (notificationId) => {
        if (window.confirm("Are you sure you want to delete this notification?")) {
            // Ensure deleteNotification is provided by your hook
            if (deleteNotification) {
                await deleteNotification(notificationId);
            } else {
                console.warn("deleteNotification function is not available in useNotifications hook.");
                // Optionally provide user feedback here
            }
        }
    }, [deleteNotification]);

    // Handle bulk actions
    const handleMarkAllAsRead = useCallback(async () => {
        try {
            await markAllAsRead(); // Call the hook's function
        } catch (error) {
            console.error(MESSAGES.MARK_ALL_READ_ERROR, error);
            // Additional user-facing error feedback could go here
        }
    }, [markAllAsRead, MESSAGES]);

    const handleClearAllNotifications = useCallback(async () => {
        if (window.confirm("Are you sure you want to clear ALL notifications? This action cannot be undone.")) {
            try {
                await clearAllNotifications();
            } catch (error) {
                console.error(MESSAGES.CLEAR_ALL_ERROR, error);
                // Additional user-facing error feedback could go here
            }
        }
    }, [clearAllNotifications, MESSAGES]);

    // Determine if there are any unread notifications for 'Mark all as read' button
    const hasUnreadNotifications = useMemo(() => {
        return notifications && notifications.some(n => !n.read);
    }, [notifications]);

    // Determine if there are any notifications at all for 'Clear all' button
    const hasAnyNotifications = useMemo(() => {
        return notifications && notifications.length > 0;
    }, [notifications]);

    // Handle initial loading states
    if (authLoading || notificationsLoading) {
        return (
            <div className={styles.fullPageStatusContainer}>
                <LoadingSpinner message={MESSAGES.LOADING_NOTIFICATIONS} />
            </div>
        );
    }

    // Handle error states
    if (notificationsError) {
        return (
            <div className={styles.errorContainer}>
                <XCircle size={48} className={styles.errorIcon} />
                <h2 className={styles.errorHeading}>Error Loading Notifications</h2>
                {/* Display error message directly from the hook's error state */}
                <p className={styles.errorText}>{notificationsError}</p>
                <p className={styles.errorText}>Please try refreshing the page.</p>
            </div>
        );
    }

    return (
        <div className={styles.notificationsPageContainer}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    <Bell size={28} className={styles.pageTitleIcon} /> Your Notifications
                </h1>
                <div className={styles.actionsGroup}>
                    <button
                        onClick={handleMarkAllAsRead}
                        className={styles.actionButton}
                        disabled={!hasUnreadNotifications || markingAll} // Use 'markingAll' from hook
                    >
                        {markingAll ? <Loader2 size={18} className={styles.spinner} /> : <MailOpen size={18} />}
                        <span>{markingAll ? MESSAGES.MARKING_ALL_READ : MESSAGES.MARK_AS_READ}</span>
                    </button>
                    <button
                        onClick={handleClearAllNotifications}
                        className={`${styles.actionButton} ${styles.dangerButton}`}
                        disabled={!hasAnyNotifications || clearing} // Use 'clearing' from hook
                    >
                        {clearing ? <Loader2 size={18} className={styles.spinner} /> : <Trash2 size={18} />}
                        <span>{clearing ? MESSAGES.CLEARING_NOTIFICATIONS : MESSAGES.CLEAR_ALL}</span>
                    </button>
                </div>
            </div>

            <div className={styles.filterTabs}>
                <button
                    className={`${styles.filterTab} ${filter === 'all' ? styles.activeTab : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Notifications
                </button>
                <button
                    className={`${styles.filterTab} ${filter === 'unread' ? styles.activeTab : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread ({notifications ? notifications.filter(n => !n.read).length : 0})
                </button>
            </div>

            <div className={styles.notificationList}>
                {filteredNotifications.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Bell size={48} className={styles.emptyStateIcon} />
                        <p className={styles.emptyStateText}>
                            {filter === 'unread'
                                ? "No unread notifications! You're all caught up."
                                : "You don't have any notifications yet."}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`${styles.notificationItem} ${notification.read ? styles.read : styles.unread}`}
                        >
                            <div className={styles.notificationContent}>
                                <p className={styles.notificationMessage}>{notification.message}</p>
                                <span className={styles.notificationTimestamp}>
                                    {/* Corrected: Convert Firestore Timestamp to Date object */}
                                    {notification.createdAt ? formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                </span>
                            </div>
                            <div className={styles.itemActions}>
                                {!notification.read && (
                                    <button
                                        className={`${styles.itemActionButton} ${styles.markReadButton}`}
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        title="Mark as Read"
                                    >
                                        <MailOpen size={18} />
                                    </button>
                                )}
                                {deleteNotification && ( // Only render if deleteNotification is available in the hook
                                    <button
                                        className={`${styles.itemActionButton} ${styles.deleteButton}`}
                                        onClick={() => handleDeleteNotification(notification.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;