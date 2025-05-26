// --- src/components/dashboard/Header.jsx ---
// Dashboard header with user greeting and notifications.
import { useState, useCallback } from 'react';
import { Bell, Menu } from 'lucide-react'; // Ensure icons are available
import PropTypes from 'prop-types';
import { mockNotifications } from '../../data'; // Import mockNotifications from data.js

const Header = ({ toggleSidebar, user }) => { // Changed currentUser to user
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

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center rounded-b-xl">
      <div className="flex items-center">
        <button className="lg:hidden mr-4 text-gray-600 hover:text-gray-900" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome, {user?.displayName?.split(' ')[0] || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Guest'}!
        </h1>
      </div>

      <div className="relative">
        <button
          onClick={toggleNotifications}
          className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Notifications"
        >
          <Bell size={24} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
            </div>
            {notifications.length > 0 ? (
              <ul>
                {notifications.map(notification => (
                  <li
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 last:border-b-0 ${
                      notification.read ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm">{notification.message}</p>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 focus:outline-none"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-center text-gray-500 text-sm">No new notifications.</p>
            )}
            <div className="p-2 text-center border-t border-gray-200">
                <button onClick={() => setNotifications([])} className="text-sm text-gray-500 hover:text-gray-700">Clear All</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

Header.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  user: PropTypes.object, // User object from AuthContext
};

export default Header;