import { Routes, Route } from 'react-router-dom';

import DashboardHome from '../../pages/studentDashboard/DashboardHome';
import Courses from '../../pages/studentDashboard/Courses'; // This component likely lists all courses
import CourseDetail from './/CourseDetail'; // <--- NEW IMPORT: CourseDetail Component
import Profile from '../../pages/studentDashboard/Profile';
import SettingsPage from '../../pages/studentDashboard/Settings';
import NotFoundPage from '../../pages/NotFoundPage';
import NotificationsPage from '../../pages/studentDashboard/NotificationsPage';
// import ExplorePrograms from '../../pages/ExplorePrograms'; 

const StudentDashboardRoutes = () => {
  return (
    <Routes>
      {/* Default dashboard page: /student/dashboard */}
      <Route index element={<DashboardHome />} />

      {/* Specific dashboard pages */}
      <Route path="courses" element={<Courses />} />
      {/* NEW ROUTE: For individual course pages. :courseId will capture the ID from the URL */}
      <Route path="courses/:courseId" element={<CourseDetail />} /> 
      
      <Route path="profile" element={<Profile />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      
      {/* Route for "Explore Programs" - ensure this matches the Link in DashboardHome */}
      {/* <Route path="/programs" element={<ExplorePrograms />} /> */}

      {/* Catch-all for unknown nested dashboard routes within /student/dashboard/ */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default StudentDashboardRoutes;