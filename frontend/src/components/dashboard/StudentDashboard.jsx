import React from 'react';
import { Routes, Route, Link, Outlet  } from 'react-router-dom'; // 👈 Updated import
import CourseProgress from './CourseProgress';
import AssignmentList from './ AssignmentList';
import AttendanceCalendar from './ AttendanceCalendar';
import NotificationCenter from './NotificationCenter';
import ProfileEditor from './ProfileEditor';
import Sidebar from './Sidebar';
import './StudentDashboard.css';
import PrivateRoute from '../auth/PrivateRoute';
import Navbar from '../Navbar/Navbar';

const StudentDashboard = () => {
  return (
    <div className="h-screen overflow-hidden"> {/* Full height and prevent overall scrolling */}
    <Navbar />   {/* Include the Navbar at the top */}
      <div className="flex h-full mt-[80px]"> {/* Flex container for Sidebar and main content, adjust marginTop */}
        <div className="sidebar min-w-[220px]">
          <Sidebar />
        </div>
        <div className="main-content flex-1 overflow-y-auto p-4">
          <Outlet /> {/* This is where the child routes will render */}
        </div>
      </div>
    </div>
  );
};

const StudentDashboardRoutes = () => (
  <Routes>
    {/* <Route
      path="/"
      element={
        <PrivateRoute role="student">
          <h2>Please select a section from the sidebar.</h2>
        </PrivateRoute>
      }
    /> */}
    <Route
      path="enrolled-courses"
      element={
        <PrivateRoute role="student">
          <CourseProgress />
        </PrivateRoute>
      }
    />
    <Route
      path="assignments"
      element={
        <PrivateRoute role="student">
          <AssignmentList />
        </PrivateRoute>
      }
    />
    <Route
      path="attendance"
      element={
        <PrivateRoute role="student">
          <AttendanceCalendar />
        </PrivateRoute>
      }
    />
    <Route
      path="notifications"
      element={
        <PrivateRoute role="student">
          <NotificationCenter />
        </PrivateRoute>
      }
    />
    <Route
      path="my-profile"
      element={
        <PrivateRoute role="student">
          <ProfileEditor />
        </PrivateRoute>
      }
    />
  </Routes>
);

export default StudentDashboard;
export { StudentDashboardRoutes };