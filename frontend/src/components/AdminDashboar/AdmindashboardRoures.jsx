// src/routes/AdminDashboardRoutes.jsx (assuming this path)
import { Routes, Route } from 'react-router-dom';
// import Courses from '../../pages/adminDashbord/Courses'; // This old component might be removed or repurposed
import NotFoundPage from '../../pages/NotFoundPage';
import Dashboard from '../../pages/adminDashbord/Dashboard';
import Students from '../../pages/adminDashbord/Students';
import Profile from '../../pages/studentDashboard/Profile';
import SendNotification from '../../pages/adminDashbord/SendNotification';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import AddProgram from '../AdminDashboar/AddProgram';
import ManageCourses from '../AdminDashboar/ManageCourses'; // New
import CourseForm from '../AdminDashboar/CourseForm';     // New

const AdminDashboardRoutes = () => {
  const { user } = useAuth(); // <--- GET user from AuthContext

  // IMPORTANT: You might want to add a loading state or redirect if user is not an admin
  // or if auth is still loading. For now, we'll just pass the user.
  if (!user) {
    // You could render a loading spinner, or redirect to login
    return <LoadingSpinner />;
  }

  // Optional: Add a check for admin role if your AuthContext provides it
  // For a robust system, ensure this check is present.
  // if (!user.isAdmin) {
  //   return <p>Access Denied: You are not authorized to view this section.</p>;
  //   // Or redirect to a login/unauthorized page:
  //   // return <Navigate to="/unauthorized" replace />;
  // }

  return (
    <Routes>
      {/* Default route for /admin/ */}
      <Route index element={<Dashboard />} />

      {/* Explicit Dashboard route */}
      <Route path="dashboard" element={<Dashboard />} />

      {/* Courses Management */}
      {/* This wraps all course-related routes under the "courses" path */}
      <Route path="courses/*" element={<ManageCoursesWrapper />} />

      {/* Program Management */}
      <Route path="add-program" element={<AddProgram />} />

      {/* User Management */}
      <Route path="students" element={<Students />} />

      {/* Admin's own profile (assuming it shares student's profile component) */}
      <Route path="profile" element={<Profile user={user} />} />

      {/* Notification Sending */}
      <Route path="send-notification" element={<SendNotification user={user} />} />

      {/* Fallback for any unknown admin sub-routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Helper component to handle nested course routes
// This allows `/admin/courses` to show ManageCourses,
// and `/admin/courses/add` or `/admin/courses/edit/:courseId` to show CourseForm.
const ManageCoursesWrapper = () => {
  return (
    <Routes>
      <Route index element={<ManageCourses />} /> {/* Renders at /admin/courses */}
      <Route path="add" element={<CourseForm />} /> {/* Renders at /admin/courses/add */}
      <Route path="edit/:courseId" element={<CourseForm />} /> {/* Renders at /admin/courses/edit/:courseId */}
    </Routes>
  );
};

export default AdminDashboardRoutes;