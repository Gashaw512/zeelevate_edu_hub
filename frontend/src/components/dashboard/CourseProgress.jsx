import React from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const dummyCourses = [
  { id: 1, name: "Python Basics", progress: 65 },
  { id: 2, name: "Financial Literacy", progress: 40 },
  { id: 3, name: "Web Development", progress: 85 }
];

const CourseProgress = () => (
  <div className="dashboard-card">
    <h3>Course Progress</h3>
    <div className="progress-container">
      {dummyCourses.map(course => (
        <div key={course.id} className="progress-item">
          <div className="progress-bar">
            <CircularProgressbar
              value={course.progress}
              text={`${course.progress}%`}
              styles={{
                path: { stroke: `#00BFFF` },
                text: { fill: '#2C3E50', fontSize: '24px' }
              }}
            />
          </div>
          <span className="course-name">{course.name}</span>
        </div>
      ))}
    </div>
  </div>
);

export default CourseProgress;