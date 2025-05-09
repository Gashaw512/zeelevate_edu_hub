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

const StudentDashboard = () => {
  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <h1>Welcome Back, Student Name</h1>
      </header>

      <div className="dashboard-grid">
        {/* Sidebar - will navigate to different components */}
        <div className="sidebar">
          <Sidebar />
        </div>

        {/* Main Content Area - Dynamic rendering based on sidebar selection */}
        <div className="main-content">
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
      path="notification-center"
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