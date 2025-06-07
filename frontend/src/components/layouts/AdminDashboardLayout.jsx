import { useState, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Dashboard/Sidebar';
import Header from '../Dashboard/Header';
import styles from './StudentDashboard.module.css';

const AdminDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className={styles.dashboardWrapper}>
      {isSidebarOpen && (
        <div
          className={`${styles.sidebarBackdrop} ${styles.sidebarBackdropVisible}`}
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.sidebarOpen : ''
        }`}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          user={user}
          logout={logout}
          role="admin"
        />
      </div>

      <div className={styles.contentWrapper}>
        <Header 
          toggleSidebar={toggleSidebar} 
          user={user}
          role="admin"
        />
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;