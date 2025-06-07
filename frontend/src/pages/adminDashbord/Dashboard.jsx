import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getIdToken } from "firebase/auth";
import { auth } from "../../firebase/auth"; // adjust path as needed
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    loading: true,
    error: ''
  });

  //const authToken = localStorage.getItem('token') || '';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: '' }));

          const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");

    // Get fresh token from Firebase
    const authToken = await getIdToken(currentUser, true); 

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
      toast.error('Failed to fetch ');

    }
  };

  const chartData = [
    { name: 'Courses', value: stats.courses },
    { name: 'Students', value: stats.students }
  ];

  return (

    <div className="dashboard-container">
       <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <h1 className="dashboard-title">Admin Dashboard</h1>

      {stats.error && (
        <div className="error-box">{stats.error}</div>
      )}

      <div className="stats-grid">
        <div className={`stat-card ${stats.loading ? 'stat-loading' : 'stat-blue'}`}>
          <h3 className="stat-title">Total Courses</h3>
          {stats.loading ? (
            <div className="stat-value">...</div>
          ) : (
            <p className="stat-value">{stats.courses}</p>
          )}
        </div>
        <div className={`stat-card ${stats.loading ? 'stat-loading' : 'stat-green'}`}>
          <h3 className="stat-title">Total Students</h3>
          {stats.loading ? (
            <div className="stat-value">...</div>
          ) : (
            <p className="stat-value">{stats.students}</p>
          )}
        </div>
      </div>

      {!stats.loading && (
        <div className="chart-grid">
          <div className="card">
            <h2 className="card-title">Student vs Course Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="card-title">Bar Chart Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Quick Actions</h2>
        <div className="quick-actions">
          <a href="/admin/courses" className="button button-blue">
            Manage Courses
          </a>
          <a href="/admin/students" className="button button-green">
            View All Students
          </a>
          <button
            onClick={fetchStats}
            className="button button-gray"
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
