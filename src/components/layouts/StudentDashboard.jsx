import React, { useState, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Dashboard/Sidebar';
import Header from '../Dashboard/Header';

import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <div style={{ fontSize: '18px', color: '#4b5563' }}>Loading user data...</div>
      </div>
    );
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
          onNavigate={handleNavigate}
          user={user}
          logout={logout}
        />
      </div>

      <div className={styles.contentWrapper}>
        <Header toggleSidebar={toggleSidebar} user={user} />
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
