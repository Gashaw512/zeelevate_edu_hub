// --- src/components/dashboard/Sidebar.jsx ---
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, Settings, LogOut, X } from 'lucide-react';
import React from 'react';
import PropTypes from 'prop-types';

// Import the CSS module
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, toggleSidebar, onNavigate, user, logout }) => {
  const location = useLocation();
  const isLargeScreen = window.innerWidth >= 1024;

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/student/dashboard' },
    { name: 'My Courses', icon: BookOpen, path: '/student/dashboard/courses' },
    { name: 'Profile', icon: User, path: '/student/dashboard/profile' },
    { name: 'Settings', icon: Settings, path: '/student/dashboard/settings' },
  ];

  return (
    <>
      {isOpen && !isLargeScreen && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}

      <div
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''} ${
          isLargeScreen ? styles.sidebarLargeToggle : ''
        }`}
      >
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>ZEELEVATE</h2>
          <button className={styles.closeButton} onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <ul>
            {navItems.map((item) => (
              <li key={item.name} className={styles.navItem}>
                <Link
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`${styles.navLink} ${
                    location.pathname === item.path ? styles.navLinkActive : ''
                  }`}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          {user && (
            <div className={styles.userInfo}>
              <img
                src={user.photoURL || user.avatar || 'https://placehold.co/50x50/333333/cccccc?text=User'}
                alt="User Avatar"
                className={styles.userAvatar}
              />
              <div>
                <p className={styles.userName}>{user.displayName || user.name || user.email}</p>
                <p className={styles.userRole}>{user.role}</p>
              </div>
            </div>
          )}
          <button onClick={logout} className={styles.logoutButton}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  user: PropTypes.object,
  logout: PropTypes.func.isRequired,
};

export default Sidebar;