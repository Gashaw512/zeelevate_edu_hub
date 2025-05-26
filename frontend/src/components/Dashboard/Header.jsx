import React, { useState, useCallback } from 'react';
import { Bell, Menu } from 'lucide-react'; // Using lucide-react for icons
import PropTypes from 'prop-types';

// Mock notification data for demonstration purposes
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

  // Calculate the number of unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Toggle notification dropdown visibility
  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  // Mark a specific notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <>
      {/* Embedded CSS for styling */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            background-color: #f0f2f5; /* Light background for the overall page */
        }

        .header-container {
            background-color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            padding: 1rem 1.5rem; /* Increased padding */
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 0 0 1rem 1rem; /* Rounded bottom corners */
            position: relative; /* For z-index context */
            z-index: 10; /* Ensure header is above other content */
        }

        .header-left {
            display: flex;
            align-items: center;
        }

        .menu-button {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            margin-right: 1rem;
            color: #6b7280; /* text-gray-600 */
            transition: color 0.2s ease, background-color 0.2s ease;
            border-radius: 0.5rem;
            display: none; /* Hidden by default, shown on smaller screens */
        }

        .menu-button:hover {
            color: #1f2937; /* text-gray-900 */
            background-color: #f3f4f6; /* bg-gray-100 */
        }

        @media (max-width: 1023px) { /* lg:hidden breakpoint */
            .menu-button {
                display: block;
            }
        }

        .greeting {
            font-size: 1.625rem; /* Slightly larger font */
            font-weight: 600;
            color: #1f2937; /* text-gray-800 */
            line-height: 1.2;
        }

        @media (max-width: 767px) { /* Adjust greeting size for smaller screens */
            .greeting {
                font-size: 1.3rem;
            }
        }

        .notifications-wrapper {
            position: relative;
        }

        .notifications-button {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.75rem; /* Increased padding */
            border-radius: 9999px; /* Fully rounded */
            transition: background-color 0.2s ease, box-shadow 0.2s ease;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .notifications-button:hover {
            background-color: #f3f4f6; /* bg-gray-100 */
        }

        .notifications-button:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.4); /* focus:ring-2 focus:ring-indigo-500 */
        }

        .bell-icon {
            color: #6b7280; /* text-gray-600 */
        }

        .unread-badge {
            position: absolute;
            top: 0px; /* Adjusted position */
            right: 0px; /* Adjusted position */
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 20px; /* Ensure it's a circle */
            height: 20px;
            padding: 0 6px; /* Adjusted padding */
            font-size: 0.75rem; /* text-xs */
            font-weight: 700; /* font-bold */
            line-height: 1;
            color: #ffffff; /* text-red-100 */
            background-color: #ef4444; /* red-600 */
            border-radius: 9999px; /* rounded-full */
            border: 2px solid #ffffff; /* Small white border for contrast */
            transform: translate(25%, -25%); /* Fine-tune position */
        }

        .notifications-dropdown {
            position: absolute;
            right: 0;
            margin-top: 0.75rem; /* Slightly more margin */
            width: 22rem; /* Increased width */
            max-width: 90vw; /* Responsive width */
            background-color: #ffffff;
            border: 1px solid #e5e7eb; /* border-gray-200 */
            border-radius: 0.75rem; /* More rounded corners */
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15); /* Stronger shadow */
            z-index: 50;
            overflow: hidden; /* Ensures rounded corners apply to content */
            animation: fadeInScale 0.2s ease-out; /* Simple animation */
        }

        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .dropdown-header {
            padding: 1rem 1.25rem; /* Increased padding */
            border-bottom: 1px solid #e5e7eb; /* border-gray-200 */
            background-color: #f9fafb; /* Light background for header */
        }

        .dropdown-title {
            font-weight: 600;
            color: #1f2937; /* text-gray-800 */
            font-size: 1.125rem; /* Slightly larger title */
        }

        .notification-list {
            max-height: 300px; /* Max height for scrollability */
            overflow-y: auto; /* Enable vertical scrolling */
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .notification-item {
            padding: 0.85rem 1.25rem; /* Consistent padding */
            border-bottom: 1px solid #f3f4f6; /* border-gray-100 */
            transition: background-color 0.2s ease;
            display: flex;
            justify-content: space-between;
            align-items: flex-start; /* Align items to start for multi-line messages */
        }

        .notification-item:last-child {
            border-bottom: 0;
        }

        .notification-read {
            background-color: #f9fafb; /* bg-gray-50 */
            color: #9ca3af; /* text-gray-500 */
        }

        .notification-unread {
            background-color: #ffffff; /* bg-white */
            color: #374151; /* text-gray-800, slightly darker for better contrast */
        }

        .notification-unread:hover {
            background-color: #f3f4f6; /* hover:bg-gray-100 */
        }

        .notification-message {
            font-size: 0.9rem; /* Slightly larger text */
            line-height: 1.4;
            flex-grow: 1; /* Allow message to take available space */
            padding-right: 0.75rem; /* Space before button */
        }

        .mark-read-btn {
            background: none;
            border: none;
            cursor: pointer;
            flex-shrink: 0; /* Prevent button from shrinking */
            font-size: 0.75rem; /* text-xs */
            color: #4f46e5; /* text-indigo-600 */
            transition: color 0.2s ease;
            text-decoration: none; /* Remove underline */
            white-space: nowrap; /* Keep button text on one line */
            padding: 0.2rem 0.4rem; /* Small padding for button */
            border-radius: 0.3rem;
        }

        .mark-read-btn:hover {
            color: #3730a3; /* hover:text-indigo-800 */
            background-color: rgba(79, 70, 229, 0.05); /* Subtle hover background */
        }

        .no-notifications {
            padding: 1.5rem; /* Increased padding */
            text-align: center;
            color: #9ca3af; /* text-gray-500 */
            font-size: 0.9rem; /* Slightly larger text */
        }

        .clear-all-container {
            padding: 0.75rem; /* Padding for the container */
            text-align: center;
            border-top: 1px solid #e5e7eb; /* border-gray-200 */
            background-color: #f9fafb; /* Light background */
        }

        .clear-all-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 0.85rem; /* Slightly smaller text */
            color: #6b7280; /* text-gray-500 */
            transition: color 0.2s ease;
            padding: 0.3rem 0.6rem;
            border-radius: 0.3rem;
        }

        .clear-all-btn:hover {
            color: #374151; /* hover:text-gray-700 */
            background-color: #e5e7eb; /* Subtle hover background */
        }
        `}
      </style>

      <header className="header-container">
        <div className="header-left">
          <button className="menu-button" onClick={toggleSidebar} aria-label="Toggle Sidebar">
            <Menu size={24} />
          </button>
          <h1 className="greeting">
            Welcome, {user?.displayName?.split(' ')[0] || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Guest'}!
          </h1>
        </div>

        <div className="notifications-wrapper">
          <button
            onClick={toggleNotifications}
            className="notifications-button"
            aria-label="Notifications"
          >
            <Bell size={24} className="bell-icon" />
            {unreadCount > 0 && (
              <span className="unread-badge">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="dropdown-header">
                <h3 className="dropdown-title">Notifications</h3>
              </div>
              {notifications.length > 0 ? (
                <ul className="notification-list">
                  {notifications.map(notification => (
                    <li
                      key={notification.id}
                      className={`notification-item ${
                        notification.read ? 'notification-read' : 'notification-unread'
                      }`}
                    >
                      <p className="notification-message">{notification.message}</p>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="mark-read-btn"
                        >
                          Mark as Read
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-notifications">No new notifications.</p>
              )}
              <div className="clear-all-container">
                  <button onClick={clearAllNotifications} className="clear-all-btn">Clear All</button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  user: PropTypes.object, // User object from AuthContext
};

export default Header;
