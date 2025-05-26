import React from 'react';

const dummyAttendance = [
  { date: "2023-11-01", present: true },
  { date: "2023-11-02", present: false },
  { date: "2023-11-03", present: true },
  // ... add more dates
];

const AttendanceCalendar = () => (
  <div className="dashboard-card">
    <h3>Attendance</h3>
    <div className="attendance-grid">
      {dummyAttendance.map((day, index) => (
        <div 
          key={index}
          className={`attendance-day ${day.present ? 'present' : 'absent'}`}
        >
          {new Date(day.date).getDate()}
        </div>
      ))}
    </div>
    <div className="attendance-stats">
      <span>This Month: 85%</span>
      <span>Overall: 90%</span>
    </div>
  </div>
);

export default AttendanceCalendar;