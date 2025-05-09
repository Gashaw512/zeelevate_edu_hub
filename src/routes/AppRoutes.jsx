import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Blog from "../pages/Blog";
import Contact from "../pages/Contact";
import Course from "../pages/Course";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import PrivateRoute from "../components/auth/PrivateRoute";
import StudentDashboardPage from "../pages/StudentDashboardPage"; // Import both

import { StudentDashboardRoutes } from "../components/dashboard/StudentDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/course" element={<Course />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/student/dashboard" element={
        <PrivateRoute role="student">
          <StudentDashboardPage /> {/* Render the layout component */}
        </PrivateRoute>
      }>
        {/* Define child routes here */}
        <Route path="*" element={<StudentDashboardRoutes />} /> {/* Render all dashboard routes within the outlet */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;