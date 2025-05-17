import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import About from "../pages/About";
import Blog from "../pages/Blog";
import Contact from "../pages/Contact";
import Course from "../pages/Course";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import PrivateRoute from "../components/auth/PrivateRoute";
import StudentDashboardPage from "../pages/StudentDashboardPage"; // Import if you need this on a separate route
import StudentDashboard from "../components/dashboard/StudentDashboard"; // Import the layout component
import { StudentDashboardRoutes } from "../components/dashboard/StudentDashboard";
import HomePageWithScroll from "../pages/HomePageWithScroll";
// import LinkedInCallback from "../components/auth/LinkedInCallback";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePageWithScroll />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      {/* <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} /> */}

      {/* Student Dashboard Route */}
      <Route path="/student/dashboard/*" element={
        <PrivateRoute role="student">
          <StudentDashboard /> {/* Render the layout component */}
        </PrivateRoute>
      }>
        {/* Define child routes here */}
        {/* The * wildcard allows for nested routes */}
        <Route path="*" element={<StudentDashboardRoutes />} /> {/* Render all dashboard routes as children within the Outlet */}
      </Route>

      {/* If you need StudentDashboardPage on a different route */}
      <Route path="/student-page" element={<StudentDashboardPage />} /> 
    </Routes>
  );
};

export default AppRoutes;

{/* <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/signin" element={<SignInPage />} />
  <Route path="/signup" element={<SignUpPage />} />
  <Route path="/student/dashboard/*" element={
    <PrivateRoute role="student">
      <StudentDashboard />
    </PrivateRoute>
  }>
    <Route path="*" element={<StudentDashboardRoutes />} />
  </Route>
</Routes> */}
