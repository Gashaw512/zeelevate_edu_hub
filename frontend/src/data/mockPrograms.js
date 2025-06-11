// src/data/mockPrograms.js

export const MOCK_PROGRAMS = [
  {
    id: 'teen-programs',
    name: 'Teen Programs',
    shortDescription: 'Designed for young learners, covering foundational skills.',
    fixedPrice: 150.00,
    courses: [
      { id: 'teen-python', name: 'Python for Teens' },
      { id: 'teen-digital-lit', name: 'Digital Citizenship for Youth' },
      { id: 'teen-coding-basics', name: 'Coding Basics for Kids' },
    ],
  },
  {
    id: 'adult-programs',
    name: 'Adult Programs',
    shortDescription: 'Advanced skills and career development for professionals.',
    price: 280.00,
    courses: [
      { id: 'adult-financial-lit', name: 'Financial Literacy for Adults' },
      { id: 'adult-college-prep', name: 'Career & College Readiness' },
      { id: 'adult-excel', name: 'Excel for Professionals' },
      { id: 'adult-web-dev', name: 'Web Development Bootcamp' },
    ],
  },
];