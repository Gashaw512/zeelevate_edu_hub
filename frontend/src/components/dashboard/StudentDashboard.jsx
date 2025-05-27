// src/layouts/StudentDashboard.jsx (Parent Component)
import { useState, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../components/Dashboard/Sidebar';
import Header from '../components/Navbar/Navbar'; // Your existing navbar

const StudentDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-700">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header /> {/* Your existing navbar */}
      
      <div className="lg:pl-64"> {/* Offset for sidebar */}
        <main className="p-4 md:p-6 lg:mt-16"> {/* Adjust top margin for navbar */}
          <Outlet />
        </main>
      </div>
      
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        logout={logout}
      />
    </div>
  );
};

export default StudentDashboard;