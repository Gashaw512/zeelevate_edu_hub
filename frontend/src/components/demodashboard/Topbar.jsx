// src/components/dashboard/Topbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your Firebase auth logout logic here
    navigate("/signin");
  };

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800">Student Dashboard</h1>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;