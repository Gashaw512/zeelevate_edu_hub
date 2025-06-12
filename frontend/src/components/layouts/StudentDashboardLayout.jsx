import  { useState, useCallback} from 'react'; 
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Dashboard/Sidebar';
import Header from '../Dashboard/Header';

import styles from './StudentDashboardLayout.module.css';

const StudentDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading, logout } = useAuth(); // Destructure 'loading' from useAuth
  const navigate = useNavigate();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleNavigate = useCallback((path) => {
    navigate(path);
    // Close sidebar on navigation for better mobile UX
    setIsSidebarOpen(false);
  }, [navigate]);

  // The initial loading state is primarily handled by PrivateRoute.
  // This check here is a safeguard, but shouldn't often be hit if PrivateRoute works correctly.
  // You might remove this if you're confident in PrivateRoute's handling.
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <div style={{ fontSize: '18px', color: '#4b5563' }}>Loading dashboard...</div>
      </div>
    );
  }

  // This check should ideally be handled by PrivateRoute *before* rendering this component.
  // If user somehow becomes null here, it means PrivateRoute failed, or user logged out mid-render.
  // For safety, you could redirect, but PrivateRoute is designed to prevent this.
  // You might even remove this check as PrivateRoute ensures `user` exists when `StudentDashboardLayout` renders.
  if (!user) {
      // This scenario *should* be caught by PrivateRoute, but as a safeguard:
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
          onNavigate={handleNavigate}
          user={user} // Pass user data to Sidebar for display
          logout={logout} // Pass logout function
        />
      </div>

      <div className={styles.contentWrapper}>
        <Header toggleSidebar={toggleSidebar} user={user} /> {/* Pass user to Header */}
        <main className={styles.mainContent}>
          <Outlet /> {/* This is where the nested routes from StudentDashboardRoutes will render */}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboardLayout;