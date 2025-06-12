import { Routes, Route } from 'react-router-dom';
import Courses from '../../pages/adminDashbord/Courses';
import NotFoundPage from '../../pages/NotFoundPage'; 
import Dashboard from '../../pages/adminDashbord/Dashboard';
import Students from '../../pages/adminDashbord/Students';
import Profile from '../../pages/studentDashboard/Profile'; // Assuming Admin profile also uses this or similar
import SendNotification from '../../pages/adminDashbord/SendNotification';
import { useAuth } from '../../context/AuthContext'; // <--- IMPORT useAuth hook
import LoadingSpinner from '../common/LoadingSpinner'; // Optional: If you want to show a loading spinner

const AdminDashboardRoutes = () => {
  const { user } = useAuth(); // <--- GET user from AuthContext

  // IMPORTANT: You might want to add a loading state or redirect if user is not an admin
  // or if auth is still loading. For now, we'll just pass the user.
  if (!user) {
    // You could render a loading spinner, or redirect to login
    // console.log("AdminDashboardRoutes: User not available yet, or not logged in.");
    return <div><LoadingSpinner/></div>;
  }
  
  // Optional: Add a check for admin role if your AuthContext provides it
  // if (!user.isAdmin) { // Assuming your user object has an isAdmin property or similar
  //   return <p>Access Denied: You are not authorized to view this section.</p>;
  //   // Or redirect to a different page
  // }


  return (
    <Routes>
      {/* Default dashboard page: /admin/dashboard */}
      <Route index element={<Dashboard />} />

      {/* Specific dashboard pages */}
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="courses" element={<Courses />} />
      <Route path="students" element={<Students />} />
      {/* Assuming Profile is a shared component or needs user prop for admin as well */}
      <Route path="profile" element={<Profile user={user} />} /> 
      {/* Correctly pass the user prop to SendNotification */}
      <Route path="send-notification" element={<SendNotification user={user} />} />
      

  
      <Route path="*" element={<NotFoundPage />} /> {/* Render your general 404 page for sub-routes */}
    </Routes>
  );
};

export default AdminDashboardRoutes;