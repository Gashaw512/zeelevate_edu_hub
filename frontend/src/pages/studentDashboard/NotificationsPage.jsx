// src/pages/NotificationsPage/NotificationsPage.js
import { useState, useMemo, useCallback } from 'react';
// No longer import useNotifications directly, use the context
// import useNotifications, { NOTIFICATION_MESSAGES } from '../../hooks/useNotifications';
import { useNotificationsContext, NOTIFICATION_MESSAGES } from '../../context/NotificationsContext'; // Import from context
import { useAuth } from '../../context/AuthContext'; // Still needed for user ID

// You might still import these if they are generic components not strictly part of NotificationsContext
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';
import Modal from '../../components/common/Modal';

import { formatDistanceToNow } from 'date-fns';
import { Bell, MailOpen, Trash2, Loader2, AlertCircle } from 'lucide-react';

import styles from './NotificationsPage.module.css';


const NotificationsPage = () => {
    const { loading: authLoading } = useAuth(); // We don't need `user` directly here, it's passed to context provider

    // Consume the notification state and actions from the context
    const {
        notifications,
        loading: notificationsLoading,
        error: notificationsError,
        markAsRead,
        markAllAsRead,
        markingAll,
        clearing,
        toastMessage,
        requiresConfirmation,
        notificationToDeleteId,
        requestClearAllConfirmation,
        confirmClearAllNotifications,
        requestDeleteConfirmation,
        confirmDeleteNotification,
        cancelConfirmation,
        NOTIFICATION_MESSAGES, // Now correctly destructured from the context
    } = useNotificationsContext(); // No userId prop needed here

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

    // This function now requests confirmation for deleting a single notification
    const handleDeleteNotificationClick = useCallback((notificationId) => {
        requestDeleteConfirmation(notificationId); // Triggers the modal
    }, [requestDeleteConfirmation]);


    // Determine if there are any unread notifications for 'Mark all as read' button
    const hasUnreadNotifications = useMemo(() => {
        return notifications && notifications.some(n => !n.read);
    }, [notifications]);

    // Determine if there are any notifications at all for 'Clear all' button
    const hasAnyNotifications = useMemo(() => {
        return notifications && notifications.length > 0;
    }, [notifications]);

    // Get the message content for the notification currently pending deletion
    const notificationToDeleteMessage = useMemo(() => {
        if (notificationToDeleteId) {
            const notification = notifications.find(n => n.id === notificationToDeleteId);
            return notification ? notification.message : '';
        }
        return '';
    }, [notificationToDeleteId, notifications]);

    // Handle initial loading states
    if (authLoading || notificationsLoading) {
        return (
            <div className={styles.fullPageStatusContainer}>
                <LoadingSpinner message={NOTIFICATION_MESSAGES.LOADING_NOTIFICATIONS} />
            </div>
        );
    }

    // Handle error states
    if (notificationsError) {
        return (
            <div className={styles.errorContainer}>
                <AlertCircle size={48} className={styles.errorIcon} />
                <h2 className={styles.errorHeading}>Error Loading Notifications</h2>
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
                        onClick={markAllAsRead}
                        className={styles.actionButton}
                        disabled={!hasUnreadNotifications || markingAll}
                    >
                        {markingAll ? <Loader2 size={18} className={styles.spinner} /> : <MailOpen size={18} />}
                        <span>{markingAll ? NOTIFICATION_MESSAGES.MARKING_ALL_READ : NOTIFICATION_MESSAGES.MARK_AS_READ}</span>
                    </button>
                    <button
                        onClick={requestClearAllConfirmation} // Calls the confirmation function
                        className={`${styles.actionButton} ${styles.dangerButton}`}
                        disabled={!hasAnyNotifications || clearing}
                    >
                        {clearing ? <Loader2 size={18} className={styles.spinner} /> : <Trash2 size={18} />}
                        <span>{clearing ? NOTIFICATION_MESSAGES.CLEARING_NOTIFICATIONS : NOTIFICATION_MESSAGES.CLEAR_ALL}</span>
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
                                ? NOTIFICATION_MESSAGES.NO_NEW_NOTIFICATIONS_UNREAD
                                : NOTIFICATION_MESSAGES.NO_NEW_NOTIFICATIONS}
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
                                <button
                                    className={`${styles.itemActionButton} ${styles.deleteButton}`}
                                    onClick={() => handleDeleteNotificationClick(notification.id)} // Calls the confirmation request
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- Toast Component --- */}
            {toastMessage && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                />
            )}

            {/* --- Confirmation Modals --- */}
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

            {requiresConfirmation && requiresConfirmation.type === 'deleteSingle' && hasAnyNotifications && (
                <Modal
                    title="Confirm Notification Deletion"
                    // Display the message of the notification being deleted in the modal
                    message={`${NOTIFICATION_MESSAGES.CONFIRM_DELETE_SINGLE}\n\n"${notificationToDeleteMessage}"`}
                    onConfirm={confirmDeleteNotification}
                    onCancel={cancelConfirmation}
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            )}
        </div>
    );
};

export default NotificationsPage;