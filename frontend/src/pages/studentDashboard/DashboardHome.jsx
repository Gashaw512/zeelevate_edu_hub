// --- src/pages/DashboardHome.jsx ---
// Dashboard overview page.
import React from 'react'; // Ensure React is imported
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Home, BarChart2, Bell, User as UserIcon } from 'lucide-react'; // Renamed User to UserIcon to avoid conflict
import { useAuth } from '../../context/AuthContext'; // Use YOUR useAuth
import StatCard from '../../components/Dashboard/StatCard'; // Import StatCard

const DashboardHome = () => {
  const { user } = useAuth(); // Get 'user' from your AuthContext

  // Ensure user and its properties are available before rendering
  if (!user || !user.progress || !user.recentActivity) {
    return (
      <div className="flex justify-center items-center h-full text-gray-600">
        Loading dashboard data...
      </div>
    );
  }

  const progressData = [
    { name: 'Completed', value: user.progress.completedCourses || 0 },
    { name: 'In Progress', value: (user.progress.totalCourses || 0) - (user.progress.completedCourses || 0) },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Courses" value={user.progress.totalCourses || 0} icon={BookOpen} />
        <StatCard title="Courses Completed" value={user.progress.completedCourses || 0} icon={Home} />
        <StatCard title="Hours Spent" value={user.progress.hoursSpent || 0} icon={BarChart2} />
        <StatCard title="Badges Earned" value={user.progress.badgesEarned || 0} icon={Bell} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Progress Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Course Completion Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <ul>
            {(user.recentActivity || []).map((activity) => (
              <li key={activity.id} className="flex items-start mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="mr-3">
                  {activity.type === 'course_completion' && <BookOpen size={20} className="text-green-500" />}
                  {activity.type === 'quiz_pass' && <BarChart2 size={20} className="text-blue-500" />}
                  {activity.type === 'new_enrollment' && <Home size={20} className="text-purple-500" />}
                  {activity.type === 'course_creation' && <BookOpen size={20} className="text-yellow-500" />}
                  {activity.type === 'student_feedback' && <UserIcon size={20} className="text-red-500" />}
                </div>
                <div>
                  <p className="text-gray-700">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
