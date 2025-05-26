// src/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";

// Public Pages
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import LandingPage from "../pages/LandingPage";

// Payment & Success Pages
import CheckoutPage from "../pages/CheckoutPage";         // Add this page
import PaymentSuccessPage from "../pages/PaymentSuccessPage";  // Add this page

// Dashboard Related
import PrivateRoute from "../components/auth/PrivateRoute";
import StudentDashboardPage from "../pages/StudentDashboardPage";
import StudentDashboard from "../components/layouts/StudentDashboard";
// import { StudentDashboardRoutes } from "../components/dashboard/StudentDashboard";
import StudentDashboardRoutes from "../components/Dashboard/StudentDashboardRoutes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* New Routes for Payment Flow */}
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />

      {/* Student Dashboard Route (Protected) */}
  {/* Student Dashboard Route (Protected) */}
      <Route
        path="/student/dashboard/*" // Use /* for nested routes
        element={
          <PrivateRoute role="student">
            <StudentDashboard /> {/* Layout component with nav/sidebar */}
          </PrivateRoute>
        }
      >
        {/* All nested dashboard routes come here via Outlet from StudentDashboard */}
        <Route path="*" element={<StudentDashboardRoutes />} />
      </Route>

      {/* Optional: If you still use a standalone dashboard page */}
      {/* <Route path="/student-page" element={<StudentDashboardPage />} /> */}

      {/* Fallback or catch-all route */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
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
