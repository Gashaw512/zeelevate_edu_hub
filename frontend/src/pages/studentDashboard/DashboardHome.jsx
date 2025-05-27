// Dashboard overview page.

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Home, BarChart2, Bell, User as UserIcon } from 'lucide-react'; // Renamed User to UserIcon to avoid conflict
import { useAuth } from '../../context/AuthContext'; 
import StatCard from '../../components/Dashboard/StatCard';
import styles from './DashboardHome.module.css';

const DashboardHome = () => {
  // const { user } = useAuth(); // Get 'user' from your AuthContext

  const user = {
    progress: {
      totalCourses: 10,
      completedCourses: 6,
      hoursSpent: 45,
      badgesEarned: 3,
    },
    recentActivity: [
      { id: 1, type: 'course_completion', description: 'Completed React Basics course', date: '2025-05-25' },
      { id: 2, type: 'quiz_pass', description: 'Passed HTML Quiz', date: '2025-05-24' },
      { id: 3, type: 'new_enrollment', description: 'Enrolled in JavaScript Advanced course', date: '2025-05-23' },
      { id: 4, type: 'student_feedback', description: 'Left feedback on Python Basics', date: '2025-05-22' },
      { id: 5, type: 'course_creation', description: 'Created new course: CSS Mastery', date: '2025-05-20' },
    ],
  };
  

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
    <div className={styles.container}>
      <div className={styles.statGrid}>
        <StatCard title="Total Courses" value={user.progress.totalCourses} icon={BookOpen} />
        <StatCard title="Courses Completed" value={user.progress.completedCourses} icon={Home} />
        <StatCard title="Hours Spent" value={user.progress.hoursSpent} icon={BarChart2} />
        <StatCard title="Badges Earned" value={user.progress.badgesEarned} icon={Bell} />
      </div>

      <div className={styles.statGrid}>
        {/* Chart */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Course Completion Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366F1" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Recent Activity</h3>
          <ul className={styles.activityList}>
            {user.recentActivity.map((activity) => (
              <li key={activity.id} className={styles.activityItem}>
                <div className={styles.iconWrapper}>
                  {activity.type === 'course_completion' && <BookOpen size={20} className="text-green-500" />}
                  {activity.type === 'quiz_pass' && <BarChart2 size={20} className="text-blue-500" />}
                  {activity.type === 'new_enrollment' && <Home size={20} className="text-purple-500" />}
                  {activity.type === 'course_creation' && <BookOpen size={20} className="text-yellow-500" />}
                  {activity.type === 'student_feedback' && <UserIcon size={20} className="text-red-500" />}
                </div>
                <div>
                  <p className={styles.activityText}>{activity.description}</p>
                  <p className={styles.activityDate}>{activity.date}</p>
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
