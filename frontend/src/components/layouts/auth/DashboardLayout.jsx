import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { Home, BookOpen, User, Settings, LogOut, Menu, X, BarChart2, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Mock Data ---
// src/data.js
const mockUsers = {
  'user123': {
    id: 'user123',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    role: 'Student',
    avatar: 'https://placehold.co/150x150/A78BFA/ffffff?text=AJ', // Tailwind purple-300
    progress: {
      totalCourses: 5,
      completedCourses: 3,
      hoursSpent: 120,
      badgesEarned: 7,
    },
    recentActivity: [
      { id: 'act1', type: 'course_completion', description: 'Completed "React Fundamentals"', date: '2024-05-20' },
      { id: 'act2', type: 'quiz_pass', description: 'Passed "JavaScript Basics Quiz"', date: '2024-05-18' },
      { id: 'act3', type: 'new_enrollment', description: 'Enrolled in "Advanced CSS"', date: '2024-05-15' },
    ],
  },
  'user456': {
    id: 'user456',
    name: 'Bob Smith',
    email: 'bob.s@example.com',
    role: 'Instructor',
    avatar: 'https://placehold.co/150x150/FCD34D/333333?text=BS', // Tailwind yellow-300
    progress: {
      totalCourses: 10,
      completedCourses: 8,
      hoursSpent: 250,
      badgesEarned: 12,
    },
    recentActivity: [
      { id: 'act4', type: 'course_creation', description: 'Published "Node.js API Development"', date: '2024-05-22' },
      { id: 'act5', type: 'student_feedback', description: 'Reviewed student submissions for "Python Basics"', date: '2024-05-19' },
    ],
  }
};

const mockCourses = [
  { id: 'c1', title: 'React Fundamentals', instructor: 'Jane Doe', progress: '80%', status: 'In Progress', imageUrl: 'https://placehold.co/300x200/60A5FA/ffffff?text=React' },
  { id: 'c2', title: 'Advanced CSS & SASS', instructor: 'John Smith', progress: '50%', status: 'In Progress', imageUrl: 'https://placehold.co/300x200/F87171/ffffff?text=CSS' },
  { id: 'c3', title: 'JavaScript Algorithms', instructor: 'Alice Johnson', progress: '100%', status: 'Completed', imageUrl: 'https://placehold.co/300x200/34D399/ffffff?text=JS' },
  { id: 'c4', title: 'Python for Data Science', instructor: 'Bob Smith', progress: '20%', status: 'Not Started', imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=Python' },
];

const mockNotifications = [
  { id: 'n1', message: 'Your "React Fundamentals" quiz is due tomorrow!', type: 'alert', read: false },
  { id: 'n2', message: 'New content added to "Advanced CSS & SASS".', type: 'info', read: false },
  { id: 'n3', message: 'Congratulations! You earned the "Code Master" badge.', type: 'success', read: true },
];

// --- Auth Context ---
// src/context/AuthContext.jsx
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Simulate user login/logout
  useEffect(() => {
    // In a real app, this would check Firebase auth state or a token
    const storedUserId = localStorage.getItem('mockUserId');
    if (storedUserId && mockUsers[storedUserId]) {
      setCurrentUser(mockUsers[storedUserId]);
    }
    setLoadingAuth(false);
  }, []);

  const login = useCallback((userId) => {
    if (mockUsers[userId]) {
      setCurrentUser(mockUsers[userId]);
      localStorage.setItem('mockUserId', userId);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('mockUserId');
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

// --- Components ---

// src/components/Sidebar.jsx
const Sidebar = ({ isOpen, toggleSidebar, onNavigate, currentUser, logout }) => {
  const navItems = [
    { name: 'Dashboard', icon: Home, page: 'dashboard' },
    { name: 'My Courses', icon: BookOpen, page: 'courses' },
    { name: 'Profile', icon: User, page: 'profile' },
    { name: 'Settings', icon: Settings, page: 'settings' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 flex flex-col rounded-r-xl`}
      >
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-indigo-300">My Dashboard</h2>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-grow p-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.name} className="mb-2">
                <button
                  onClick={() => { onNavigate(item.page); toggleSidebar(); }}
                  className="flex items-center w-full p-3 rounded-lg text-lg hover:bg-gray-700 transition duration-200"
                >
                  <item.icon size={20} className="mr-3" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          {currentUser && (
            <div className="flex items-center mb-4">
              <img
                src={currentUser.avatar || 'https://placehold.co/50x50/cccccc/333333?text=User'}
                alt="User Avatar"
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
              <div>
                <p className="font-semibold">{currentUser.name}</p>
                <p className="text-sm text-gray-400">{currentUser.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => { logout(); onNavigate('login'); toggleSidebar(); }}
            className="flex items-center w-full p-3 rounded-lg text-lg bg-red-600 hover:bg-red-700 transition duration-200"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

// src/components/Header.jsx
const Header = ({ toggleSidebar, currentUser }) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center rounded-b-xl">
      <div className="flex items-center">
        <button className="lg:hidden mr-4 text-gray-600 hover:text-gray-900" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome, {currentUser?.name.split(' ')[0] || 'Guest'}!
        </h1>
      </div>

      <div className="relative">
        <button
          onClick={toggleNotifications}
          className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Notifications"
        >
          <Bell size={24} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
            </div>
            {notifications.length > 0 ? (
              <ul>
                {notifications.map(notification => (
                  <li
                    key={notification.id}
                    className={`p-3 border-b border-gray-100 last:border-b-0 ${
                      notification.read ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm">{notification.message}</p>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 focus:outline-none"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-center text-gray-500 text-sm">No new notifications.</p>
            )}
            <div className="p-2 text-center border-t border-gray-200">
                <button onClick={() => setNotifications([])} className="text-sm text-gray-500 hover:text-gray-700">Clear All</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// src/pages/DashboardHome.jsx
const DashboardHome = ({ currentUser }) => {
  const progressData = [
    { name: 'Completed', value: currentUser.progress.completedCourses },
    { name: 'In Progress', value: currentUser.progress.totalCourses - currentUser.progress.completedCourses },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Courses" value={currentUser.progress.totalCourses} icon={BookOpen} />
        <StatCard title="Courses Completed" value={currentUser.progress.completedCourses} icon={Home} />
        <StatCard title="Hours Spent" value={currentUser.progress.hoursSpent} icon={BarChart2} />
        <StatCard title="Badges Earned" value={currentUser.progress.badgesEarned} icon={Bell} />
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
            {currentUser.recentActivity.map((activity) => (
              <li key={activity.id} className="flex items-start mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="mr-3">
                  {activity.type === 'course_completion' && <BookOpen size={20} className="text-green-500" />}
                  {activity.type === 'quiz_pass' && <BarChart2 size={20} className="text-blue-500" />}
                  {activity.type === 'new_enrollment' && <Home size={20} className="text-purple-500" />}
                  {activity.type === 'course_creation' && <BookOpen size={20} className="text-yellow-500" />}
                  {activity.type === 'student_feedback' && <User size={20} className="text-red-500" />}
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

// src/components/StatCard.jsx
const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h4 className="text-3xl font-bold text-gray-900">{value}</h4>
    </div>
    <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
      <Icon size={28} />
    </div>
  </div>
);

// src/pages/Courses.jsx
const Courses = () => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Enrolled Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

// src/components/CourseCard.jsx
const CourseCard = ({ course }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform transform hover:scale-105">
    <img src={course.imageUrl} alt={course.title} className="w-full h-40 object-cover" onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x200/cccccc/333333?text=Course"; }} />
    <div className="p-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
      <p className="text-gray-600 text-sm mb-2">Instructor: {course.instructor}</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div
          className="bg-indigo-600 h-2.5 rounded-full"
          style={{ width: course.progress }}
        ></div>
      </div>
      <p className="text-sm text-gray-700">{course.progress} Progress</p>
      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-3 ${
        course.status === 'Completed' ? 'bg-green-100 text-green-800' :
        course.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {course.status}
      </span>
    </div>
    <div className="p-4 border-t border-gray-100 flex justify-end">
      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200">
        View Course
      </button>
    </div>
  </div>
);

// src/pages/Profile.jsx
const Profile = ({ currentUser }) => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-6">
          <img
            src={currentUser.avatar || 'https://placehold.co/150x150/cccccc/333333?text=User'}
            alt="Profile Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 mb-4"
          />
          <h3 className="text-2xl font-semibold text-gray-900">{currentUser.name}</h3>
          <p className="text-gray-600">{currentUser.email}</p>
          <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full mt-2">
            {currentUser.role}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Full Name</p>
              <p className="text-gray-800 font-medium">{currentUser.name}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Email Address</p>
              <p className="text-gray-800 font-medium">{currentUser.email}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Role</p>
              <p className="text-gray-800 font-medium">{currentUser.role}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Member Since</p>
              <p className="text-gray-800 font-medium">Jan 2023 (Mock)</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

// src/pages/Settings.jsx
const SettingsPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings</h2>
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Notification Preferences</h3>
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="emailNotifications" className="text-gray-700">Email Notifications</label>
          <input
            type="checkbox"
            id="emailNotifications"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
            className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Display Preferences</h3>
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="darkMode" className="text-gray-700">Dark Mode</label>
          <input
            type="checkbox"
            id="darkMode"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};


// src/layouts/DashboardLayout.jsx
const DashboardLayout = ({ children, onNavigate, currentUser, logout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex font-inter">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onNavigate={onNavigate}
        currentUser={currentUser}
        logout={logout}
      />

      <div className="flex-1 flex flex-col lg:ml-64"> {/* Adjust margin for sidebar width */}
        <Header toggleSidebar={toggleSidebar} currentUser={currentUser} />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// src/pages/LoginPage.jsx (Simple mock login page)
const LoginPage = ({ login, onNavigate }) => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  const handleLogin = useCallback(() => {
    setError('');
    if (login(userId)) {
      onNavigate('dashboard');
    } else {
      setError('Invalid user ID. Try "user123" or "user456".');
    }
  }, [userId, login, onNavigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Login to Dashboard</h2>
        <p className="text-gray-600 mb-6">Use mock user IDs: "user123" (Student) or "user456" (Instructor)</p>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter User ID (e.g., user123)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
        >
          Login
        </button>
      </div>
    </div>
  );
};


// --- Main App Component ---
// src/App.jsx
function App() {
  const [currentPage, setCurrentPage] = useState('login'); // Initial page
  const { currentUser, loadingAuth, logout } = useAuth();

  useEffect(() => {
    // If not loading auth and no current user, default to login page
    if (!loadingAuth && !currentUser && currentPage !== 'login') {
      setCurrentPage('login');
    }
    // If user logs in, navigate to dashboard
    if (currentUser && currentPage === 'login') {
      setCurrentPage('dashboard');
    }
  }, [currentUser, loadingAuth, currentPage]);

  const handleNavigate = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <div className="text-xl text-gray-700">Loading authentication...</div>
      </div>
    );
  }

  // Render Login Page if no user is authenticated
  if (!currentUser) {
    return <LoginPage login={useContext(AuthContext).login} onNavigate={handleNavigate} />;
  }

  // Render Dashboard Layout for authenticated users
  return (
    <DashboardLayout onNavigate={handleNavigate} currentUser={currentUser} logout={logout}>
      {/* Dynamic content based on currentPage state */}
      {(() => {
        switch (currentPage) {
          case 'dashboard':
            return <DashboardHome currentUser={currentUser} />;
          case 'courses':
            return <Courses />;
          case 'profile':
            return <Profile currentUser={currentUser} />;
          case 'settings':
            return <SettingsPage />;
          default:
            return <DashboardHome currentUser={currentUser} />; // Default to dashboard
        }
      })()}
    </DashboardLayout>
  );
}

// Wrap the App component with AuthProvider for context
const AppWrapper = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWrapper;

// Tailwind CSS setup (add this to your main CSS file, e.g., index.css or global.css)
// @tailwind base;
// @tailwind components;
// @tailwind utilities;

// And link Inter font in your public/index.html <head>
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
