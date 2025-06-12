// data/program.jsx
const DUMMY_PROGRAM_DATA = [
  {
    id: 'teen-program-1', // Unique ID for each program
    title: "Teen Programs (Ages 13-18)",
    price: "49.99",
    courses: [
      'Python Programming Basics',
      'Web Development Fundamentals',
      'Digital Literacy Essentials',
      'College Preparation Guide',
      'Financial Literacy for Teens'
    ],
    features: [
      'Interactive coding projects',
      'College application guidance',
      'Peer collaboration features',
      'Progress tracking dashboard'
    ],
    badge: "Most Popular 🔥",
    status: "available" // This program is available
  },
  {
    id: 'adult-program-1', // Unique ID
    title: "Adult Programs",
    price: "79.99",
    courses: [
      'Advanced Python Applications',
      'Professional Digital Skills',
      'Personal Finance Management',
      'Career Development Strategies',
      'Parenting in Digital Age'
    ],
    features: [
      'Flexible learning schedule',
      'Real-world projects',
      'Parenting in tech workshops',
      'Career advancement resources'
    ],
    badge: "Professional Certification 🎓",
    status: "unavailable" // This program is currently unavailable (e.g., coming soon)
  },
];

export default DUMMY_PROGRAM_DATA;