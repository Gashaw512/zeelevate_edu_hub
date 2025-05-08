import React from 'react';
import CourseProgress from './CourseProgress';
import AssignmentList from './ AssignmentList';
import AttendanceCalendar from './ AttendanceCalendar';
import NotificationCenter from './NotificationCenter';
import ProfileEditor from './ProfileEditor';
import './StudentDashboard.css';

const StudentDashboard = () => {
  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <h1>Welcome Back, Student Name</h1>
      </header>

      <div className="dashboard-grid">
        <div className="main-content">
          <CourseProgress />
          <AssignmentList />
          <AttendanceCalendar />
        </div>

        <div className="sidebar">
          <NotificationCenter />
          <ProfileEditor />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;