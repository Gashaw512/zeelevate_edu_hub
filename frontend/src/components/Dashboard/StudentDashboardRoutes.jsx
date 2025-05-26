// --- src/components/dashboard/StudentDashboardRoutes.jsx ---
// Defines the nested routes for the dashboard content.
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Use YOUR useAuth
import React from 'react'; // Ensure React is imported

// Import your dashboard pages
import DashboardHome from '../../pages/studentDashboard/DashboardHome'
import Courses from '../../pages/studentDashboard/Courses';
import Profile from '../../pages/studentDashboard/Profile';
import SettingsPage from '../../pages/studentDashboard/Settings';

const StudentDashboardRoutes = () => {
  const { user } = useAuth(); // Get 'user' from AuthContext

  if (!user) {
    // This case should ideally be handled by PrivateRoute, but good for robustness
    return null;
  }

  return (
    <Routes>
      {/* Default dashboard page: /student/dashboard */}
      <Route index element={<DashboardHome />} /> {/* DashboardHome now gets user from useAuth */}

      {/* Specific dashboard pages */}
      <Route path="courses" element={<Courses />} />
      <Route path="profile" element={<Profile />} /> {/* Profile now gets user from useAuth */}
      <Route path="settings" element={<SettingsPage />} />

      {/* Add more dashboard routes here as needed */}
      {/* <Route path="enrollments" element={<EnrollmentsPage />} /> */}
      {/* <Route path="grades" element={<GradesPage />} /> */}

      {/* Catch-all for unknown nested dashboard routes within /student/dashboard/ */}
      {/* <Route path="*" element={<div>Dashboard Page Not Found</div>} /> */}
    </Routes>
  );
};

export default StudentDashboardRoutes;