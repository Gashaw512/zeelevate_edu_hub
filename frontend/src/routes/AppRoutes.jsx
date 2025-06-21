import { Routes, Route } from "react-router-dom";

// Public Pages
import LandingPage from "../pages/LandingPage";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import ForgotPassword from "../components/auth/ForgotPassword";

// Payment Flow
import CheckoutPage from "../pages/CheckoutPage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";

// Layouts & Protected Routes
import PrivateRoute from "../components/auth/PrivateRoute";
import StudentDashboardLayout from "../components/layouts/StudentDashboardLayout";
import AdminDashboardLayout from "../components/layouts/AdminDashboardLayout";

// Nested Dashboard Routes
import StudentDashboardRoutes from "../components/Dashboard/StudentDashboardRoutes";
import AdminDashboardRoutes from "../components/Dashboard/AdminDashboardRoutes";

// Error & Fallback Pages
import NotFoundPage from "../pages/NotFoundPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

const AppRoutes = () => (
  <Routes>
    {/* -------- Public Routes -------- */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/signin" element={<SignInPage />} />
    <Route path="/signup" element={<SignUpPage />} />
    <Route path="/reset-password" element={<ForgotPassword />} />
    <Route path="/enroll/:programType" element={<SignUpPage />} />

    {/* -------- Payment Routes -------- */}
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/payment-success" element={<PaymentSuccessPage />} />

    {/* -------- Student Dashboard (Protected) -------- */}
    <Route
      path="/student/dashboard/*"
      element={
        <PrivateRoute allowedRoles={["student"]}>
          <StudentDashboardLayout />
        </PrivateRoute>
      }
    >
      <Route path="*" element={<StudentDashboardRoutes />} />
    </Route>

    {/* -------- Admin Dashboard (Protected) -------- */}
    <Route
      path="/admin/*"
      element={
        <PrivateRoute allowedRoles={["admin"]}>
          <AdminDashboardLayout />
        </PrivateRoute>
      }
    >
      <Route path="*" element={<AdminDashboardRoutes />} />
    </Route>

    {/* -------- Error Handling -------- */}
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
