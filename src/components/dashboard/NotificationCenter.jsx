import React from 'react';
import { FaBell } from 'react-icons/fa';

const dummyNotifications = [
  { id: 1, message: "New Python quiz posted", read: false },
  { id: 2, message: "Instructor feedback received", read: true },
  { id: 3, message: "Course schedule updated", read: false }
];

const NotificationCenter = () => {
  const unreadCount = dummyNotifications.filter(n => !n.read).length;

  return (
    <div className="dashboard-card">
      <div className="notification-header">
        <h3>Notifications</h3>
        <div className="bell-icon">
          <FaBell />
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </div>
      </div>
      <div className="notification-list">
        {dummyNotifications.map(notification => (
          <div 
            key={notification.id}
            className={`notification-item ${!notification.read ? 'unread' : ''}`}
          >
            <p>{notification.message}</p>
            {!notification.read && <div className="unread-dot"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;