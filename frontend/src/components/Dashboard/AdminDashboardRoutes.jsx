import { Routes, Route } from "react-router-dom";
import Courses from "../../pages/adminDashbord/Courses";
import NotFoundPage from "../../pages/NotFoundPage";
import Dashboard from "../../pages/adminDashbord/Dashboard";
import Students from "../../pages/adminDashbord/Students";
import Profile from "../../pages/studentDashboard/Profile";
import SendNotification from "../../pages/adminDashbord/SendNotification";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import Program from "../../pages/adminDashbord/Program"; // Assuming you have a Program component
const AdminDashboardRoutes = () => {
  const { user } = useAuth(); // <--- GET user from AuthContext

  // IMPORTANT: You might want to add a loading state or redirect if user is not an admin
  // or if auth is still loading. For now, we'll just pass the user.
  if (!user) {
    // You could render a loading spinner, or redirect to login
    // console.log("AdminDashboardRoutes: User not available yet, or not logged in.");
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  // Optional: Add a check for admin role if your AuthContext provides it
  // if (!user.isAdmin) { // Assuming your user object has an isAdmin property or similar
  //   return <p>Access Denied: You are not authorized to view this section.</p>;
  //   // Or redirect to a different page
  // }

  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="courses" element={<Courses />} />
      <Route path="students" element={<Students />} />
      <Route path="profile" element={<Profile user={user} />} />
      <Route
        path="send-notification"
        element={<SendNotification user={user} />}
      />
      <Route path="programs" element={<Program />} />
      <Route path="*" element={<NotFoundPage />} />{" "}
      {/* Render your general 404 page for sub-routes */}
    </Routes>
  );
};

export default AdminDashboardRoutes;
