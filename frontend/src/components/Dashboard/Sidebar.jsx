import React, { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, Settings, LogOut, X } from 'lucide-react';
import PropTypes from 'prop-types';

// Import the CSS module
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, toggleSidebar, user, logout }) => {
  const location = useLocation();
  // Determine if it's a large screen based on the CSS breakpoint (1024px)
  // This helps in conditionally rendering the overlay and close button
  const isLargeScreen = window.innerWidth >= 1024;

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/student/dashboard' },
    { name: 'My Courses', icon: BookOpen, path: '/student/dashboard/courses' },
    { name: 'Profile', icon: User, path: '/student/dashboard/profile' },
    { name: 'Settings', icon: Settings, path: '/student/dashboard/settings' },
  ];

  // Handle navigation and close sidebar on mobile
  const handleNavLinkClick = useCallback(() => {
    if (!isLargeScreen) {
      toggleSidebar();
    }
  }, [isLargeScreen, toggleSidebar]);

  return (
    <>
      {/* Overlay for mobile sidebar when open */}
      {isOpen && !isLargeScreen && (
        <div className={styles.overlay} onClick={toggleSidebar} aria-label="Close sidebar"></div>
      )}

      {/* Main Sidebar Container */}
      <div
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
      // The sidebar's visibility on large screens is now purely controlled by CSS
      >
        {/* Sidebar Header with Title and Close Button */}
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>ZEELEVATE</h2>
          {/* Close button now visible on all screen sizes */}
          <button
            className={styles.closeButton}
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className={styles.sidebarNav}>
          <ul>
            {navItems.map((item) => (
              <li key={item.name} className={styles.navItem}>
                <Link
                  to={item.path}
                  onClick={handleNavLinkClick} // Use the new handler
                  className={`${styles.navLink} ${location.pathname === item.path ? styles.navLinkActive : ''
                    }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span> {/* Wrap text in span for consistent styling */}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer with User Info and Logout Button */}
        <div className={styles.sidebarFooter}>
          {user && (
            <div className={styles.userInfo}>
              <img
                src={user.photoURL || user.avatar || 'https://placehold.co/50x50/333333/cccccc?text=User'}
                alt="User Avatar"
                className={styles.userAvatar}
              />
              <div className={styles.userDetails}>
                <p className={styles.userName}>{user.displayName || user.name || user.email}</p>
                <p className={styles.userRole}>{user.role || 'Student'}</p> {/* Default role */}
              </div>
            </div>
          )}
          <button onClick={logout} className={styles.logoutButton}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  user: PropTypes.object,
  logout: PropTypes.func.isRequired,
  // Removed onNavigate: PropTypes.func.isRequired, as it's no longer used
};

export default Sidebar;
