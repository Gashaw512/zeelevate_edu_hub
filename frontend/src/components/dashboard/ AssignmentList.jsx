import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';

const dummyAssignments = [
  { id: 1, title: "Python Quiz", status: "pending", deadline: "2023-11-15" },
  { id: 2, title: "Budget Project", status: "missing", deadline: "2023-11-10" },
  { id: 3, title: "HTML Exercise", status: "completed", deadline: "2023-11-05" }
];

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed': return <FaCheckCircle className="icon completed" />;
    case 'missing': return <FaExclamationTriangle className="icon missing" />;
    default: return <FaClock className="icon pending" />;
  }
};

const AssignmentList = () => (
  <div className="dashboard-card">
    <h3>Assignments</h3>
    <div className="assignment-list">
      {dummyAssignments.map(assignment => (
        <div key={assignment.id} className="assignment-item">
          <div className="status-icon">
            {getStatusIcon(assignment.status)}
          </div>
          <div className="assignment-info">
            <h4>{assignment.title}</h4>
            <p>Due: {assignment.deadline}</p>
          </div>
          <button className="action-button">
            {assignment.status === 'completed' ? 'View' : 'Submit'}
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default AssignmentList;