// --- src/data/index.js ---
// Centralized mock data for the dashboard.
export const mockUsers = {
  'user123': {
    id: 'user123',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    role: 'student', // Ensure role matches PrivateRoute expectation
    avatar: 'https://placehold.co/150x150/A78BFA/ffffff?text=AJ',
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
    role: 'instructor', // Ensure role matches PrivateRoute expectation
    avatar: 'https://placehold.co/150x150/FCD34D/333333?text=BS',
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

export const mockCourses = [
  { id: 'c1', title: 'React Fundamentals', instructor: 'Jane Doe', progress: '80%', status: 'In Progress', imageUrl: 'https://placehold.co/300x200/60A5FA/ffffff?text=React' },
  { id: 'c2', title: 'Advanced CSS & SASS', instructor: 'John Smith', progress: '50%', status: 'In Progress', imageUrl: 'https://placehold.co/300x200/F87171/ffffff?text=CSS' },
  { id: 'c3', title: 'JavaScript Algorithms', instructor: 'Alice Johnson', progress: '100%', status: 'Completed', imageUrl: 'https://placehold.co/300x200/34D399/ffffff?text=JS' },
  { id: 'c4', title: 'Python for Data Science', instructor: 'Bob Smith', progress: '20%', status: 'Not Started', imageUrl: 'https://placehold.co/300x200/FBBF24/333333?text=Python' },
];

export const mockNotifications = [
  { id: 'n1', message: 'Your "React Fundamentals" quiz is due tomorrow!', type: 'alert', read: false },
  { id: 'n2', message: 'New content added to "Advanced CSS & SASS".', type: 'info', read: false },
  { id: 'n3', message: 'Congratulations! You earned the "Code Master" badge.', type: 'success', read: true },
];

// --- src/data/navbarLinks.js ---
// Configuration for your Navbar links.
export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' }, // Assuming you have this page
  { label: 'Courses', to: '/courses' }, // Public courses page
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
];
