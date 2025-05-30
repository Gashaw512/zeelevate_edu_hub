import { Routes, Route } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext'; // Not strictly needed here if pages get user from useAuth

import DashboardHome from '../../pages/studentDashboard/DashboardHome';
import Courses from '../../pages/studentDashboard/Courses';
import Profile from '../../pages/studentDashboard/Profile';
import SettingsPage from '../../pages/studentDashboard/Settings';
import NotFoundPage from '../../pages/NotFoundPage'; // If you want a specific 404 for dashboard sub-routes

const StudentDashboardRoutes = () => {
  // const { user } = useAuth(); // If individual dashboard pages use useAuth, this isn't strictly necessary here.

  return (
    <Routes>
      {/* Default dashboard page: /student/dashboard */}
      <Route index element={<DashboardHome />} />

      {/* Specific dashboard pages */}
      <Route path="courses" element={<Courses />} />
      <Route path="profile" element={<Profile />} />
      <Route path="settings" element={<SettingsPage />} />

      {/* Add more dashboard routes here as needed */}

      {/* Catch-all for unknown nested dashboard routes within /student/dashboard/ */}
      <Route path="*" element={<NotFoundPage />} /> {/* Render your general 404 page for sub-routes */}
    </Routes>
  );
};

export default StudentDashboardRoutes;