// src/components/dashboard/DashboardContent.jsx
import React from "react";

const DashboardContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-700">Enrolled Courses</h3>
        <p className="text-3xl font-bold text-blue-600">4</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
        <p className="text-3xl font-bold text-green-600">68%</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-700">Next Deadline</h3>
        <p className="text-3xl font-bold text-yellow-600">May 15</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold text-gray-700">Total Hours Spent</h3>
        <p className="text-3xl font-bold text-purple-600">32 hrs</p>
      </div>
    </div>
  );
};

export default DashboardContent;