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




// // import { Routes, Route } from "react-router-dom";
// import Home from "../pages/Home";
// import About from "../pages/About";
// import Blog from "../pages/Blog";
// import Contact from "../pages/Contact";
// import Course from "../pages/Course";
// import SignInPage from "../pages/SignInPage";
// import SignUpPage from "../pages/SignUpPage";
// import PrivateRoute from "../components/auth/PrivateRoute";

// // Import the layout component (this is NOT a "Page" in the same sense)
// import StudentDashboard from "../components/dashboard/StudentDashboard";
// import { StudentDashboardRoutes } from "../components/dashboard/StudentDashboard";

// // Import your actual dashboard pages
// import CourseProgress from "../pages/dashboard/CourseProgressPage"; // Assuming you create these
// import AssignmentList from "../pages/dashboard/AssignmentListPage";
// import AttendanceCalendar from "../pages/dashboard/AttendanceCalendarPage";
// import NotificationCenter from "../pages/dashboard/NotificationCenterPage";
// import ProfileEditor from "../pages/dashboard/ProfileEditorPage";
// import DashboardHomePage from "../pages/dashboard/DashboardHomePage"; // A default dashboard home

// const AppRoutes = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/about" element={<About />} />
//       <Route path="/blog" element={<Blog />} />
//       <Route path="/contact" element={<Contact />} />
//       <Route path="/course" element={<Course />} />
//       <Route path="/signin" element={<SignInPage />} />
//       <Route path="/signup" element={<SignUpPage />} />

//       {/* Student Dashboard Layout and Routes */}
//       <Route path="/student/dashboard/*" element={
//         <PrivateRoute role="student">
//           <StudentDashboard /> {/* Use the layout component */}
//         </PrivateRoute>
//       }>
//         {/* Define child routes for the actual dashboard pages */}
//         <Route index element={<DashboardHomePage />} /> {/* Default dashboard page */}
//         <Route path="enrolled-courses" element={<CourseProgress />} />
//         <Route path="assignments" element={<AssignmentList />} />
//         <Route path="attendance" element={<AttendanceCalendar />} />
//         <Route path="notifications" element={<NotificationCenter />} />
//         <Route path="my-profile" element={<ProfileEditor />} />
//       </Route>

//       {/* If you still need StudentDashboardPage on a separate route */}
//       {/* <Route path="/student-info" element={<StudentDashboardPage />} /> */}
//     </Routes>
//   );
// };

// export default AppRoutes;