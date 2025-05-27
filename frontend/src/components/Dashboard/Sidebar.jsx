import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, User, Settings, LogOut, X } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, toggleSidebar, user, logout }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/student/dashboard' },
    { name: 'My Courses', icon: BookOpen, path: '/student/dashboard/courses' },
    { name: 'Profile', icon: User, path: '/student/dashboard/profile' },
    { name: 'Settings', icon: Settings, path: '/student/dashboard/settings' },
  ];

  return (
    <>
      <div
        className={`${styles.sidebarOverlay} ${isOpen ? styles.sidebarOverlayOpen : ''}`}
        onClick={toggleSidebar}
        role="presentation"
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Student Panel</h2>
          <button
            className={styles.sidebarCloseBtn}
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <ul className={styles.sidebarList}>
            {navItems.map(({ name, icon: Icon, path }) => (
              <li key={name} className={styles.sidebarItem}>
                <Link
                  to={path}
                  onClick={toggleSidebar}
                  className={`${styles.sidebarLink} ${
                    location.pathname === path ? styles.sidebarLinkActive : ''
                  }`}
                >
                  <Icon className={styles.sidebarIcon} />
                  <span>{name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          {user && (
            <div className={styles.userCard}>
              <img
                src={user.avatar || 'https://placehold.co/50x50'}
                alt="User avatar"
                className={styles.userAvatar}
              />
              <div>
                <p className={styles.userName}>{user.name || user.email}</p>
                <p className={styles.userRole}>{user.role || 'Student'}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={styles.logoutButton}
            aria-label="Log out"
          >
            <LogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
