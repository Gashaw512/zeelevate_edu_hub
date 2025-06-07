import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    loading: true,
    error: ''
  });
  const authToken = localStorage.getItem('token') || '';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: '' }));
      
      // Fetch both courses and students in parallel
      const [coursesResponse, studentsResponse] = await Promise.all([
        axios.get('http://localhost:3001/api/admin/courses', {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        axios.get('http://localhost:3001/api/admin/students', {
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ]);

      setStats({
        courses: coursesResponse.data.courses.length,
        students: studentsResponse.data.students.length,
        loading: false,
        error: ''
      });
    } catch (err) {
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data. Please try again.'
      }));
      console.error('Error fetching dashboard stats:', err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {stats.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {stats.error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`p-6 rounded-lg shadow ${stats.loading ? 'bg-gray-100' : 'bg-blue-100'}`}>
          <h3 className="text-lg font-semibold mb-2">Total Courses</h3>
          {stats.loading ? (
            <div className="h-8 w-16 bg-gray-300 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">{stats.courses}</p>
          )}
        </div>
        <div className={`p-6 rounded-lg shadow ${stats.loading ? 'bg-gray-100' : 'bg-green-100'}`}>
          <h3 className="text-lg font-semibold mb-2">Total Students</h3>
          {stats.loading ? (
            <div className="h-8 w-16 bg-gray-300 rounded animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold">{stats.students}</p>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="/admin/courses"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Manage Courses
          </a>
          <a
            href="/admin/students"
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            View All Students
          </a>
          <button
            onClick={fetchStats}
            className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            disabled={stats.loading}
          >
            {stats.loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;