// src/routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";

// Public Pages
import LandingPage from "../pages/LandingPage";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import ResetPasswordPage from "../pages/ResetPasswordPage"; // Assuming you have this

// Payment & Success Pages
import CheckoutPage from "../pages/CheckoutPage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";

// Dashboard Layouts
import PrivateRoute from "../components/auth/PrivateRoute";
import StudentDashboardLayout from "../components/layouts/StudentDashboardLayout"; // Renamed for clarity
// import AdminDashboardLayout from "../components/layouts/AdminDashboardLayout"; 

// Dashboard Specific Content Routes (nested within layouts)
import StudentDashboardRoutes from "../components/Dashboard/StudentDashboardRoutes";
// import AdminDashboardRoutes from "../components/Dashboard/AdminDashboardRoutes"; 

// Error Pages
import NotFoundPage from "../pages/NotFoundPage";
import UnauthorizedPage from "../pages/UnauthorizedPage"; // New: For access denied

const AppRoutes = () => {
  return (
    <Routes>
      {/* ========================================
        Public Routes: Accessible to all users
        ========================================
      */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {/* Consider if /enroll/:programType should lead directly to signup or 
        a pre-enrollment page that gathers info and then redirects to signup/login.
        For now, keeping as is, but it's a UX consideration.
      */}
      <Route path="/enroll/:programType" element={<SignUpPage />} />

      {/* ========================================
        Payment Flow Routes: Generally public or conditionally accessible
        (e.g., after selecting a plan, before login)
        ========================================
      */}
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />

      {/* ========================================
        Protected Routes: Require Authentication
        ========================================
      */}
      {/* Student Dashboard Group */}
      <Route
        path="/student/dashboard/*" // Use /* for nested routes
        element={
          // PrivateRoute ensures user is logged in and has 'student' role.
          // If not, it handles redirection (e.g., to /signin or /unauthorized).
          <PrivateRoute allowedRoles={["student"]}>
            {/* StudentDashboardLayout provides the common layout (sidebar, header, etc.) */}
            <StudentDashboardLayout />
          </PrivateRoute>
        }
      >
        {/* Nested routes for the student dashboard.
          These will render inside the <Outlet /> of StudentDashboardLayout.
          StudentDashboardRoutes should ideally just contain <Route> elements,
          not another <Routes> wrapper, if it's meant to be directly nested.
        */}
        <Route path="*" element={<StudentDashboardRoutes />} />
      </Route>

      {/* ========================================
        Admin Dashboard Group (Example for future expansion)
        ========================================
      */}
      {/*
      <Route
        path="/admin/dashboard/*"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="*" element={<AdminDashboardRoutes />} />
      </Route>
      */}

      {/* ========================================
        Error Handling Routes
        ========================================
      */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} /> {/*{Authorization:  For role-based access denied} */}
      <Route path="*" element={<NotFoundPage />} /> {/* Catch-all for any undefined paths */}
    </Routes>
  );
};

export default AppRoutes;