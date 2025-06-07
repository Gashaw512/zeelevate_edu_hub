import {  Routes, Route } from 'react-router-dom';
import Courses from '../../pages/adminDashbord/Courses';
import NotFoundPage from '../../pages/NotFoundPage'; 
import Dashboard from '../../pages/adminDashbord/Dashboard';
import Students from '../../pages/adminDashbord/Students';

const AdminDashboardRoutes = () => {
  // const { user } = useAuth(); // If individual dashboard pages use useAuth, this isn't strictly necessary here.

  return (
    <Routes>
      {/* Default dashboard page: /admin/dashboard */}
      <Route index element={<Dashboard />} />

      {/* Specific dashboard pages */}
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="courses" element={<Courses />} />
      <Route path="students" element={<Students />} />

  
      <Route path="*" element={<NotFoundPage />} /> {/* Render your general 404 page for sub-routes */}
    </Routes>
  );
};

export default AdminDashboardRoutes;