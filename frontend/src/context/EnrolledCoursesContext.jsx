// src/context/EnrolledCoursesContext.js
import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext'; // Assuming AuthContext is defined here
import useEnrolledCoursesFetcher from '../hooks/useEnrolledCoursesFetcher';

// Create the context
const EnrolledCoursesContext = createContext(null);

// Custom hook to consume the context
export const useEnrolledCourses = () => {
  const context = useContext(EnrolledCoursesContext);
  if (context === undefined) {
    throw new Error('useEnrolledCourses must be used within an EnrolledCoursesProvider');
  }
  return context;
};

// Provider component that wraps your application or parts of it
export const EnrolledCoursesProvider = ({ children }) => {
  const { user } = useAuth(); // Get user from AuthContext

  // Use your existing hook here. It handles fetching and memoization internally.
  // CRITICAL FIX: Destructure the ALREADY RENAMED props from useEnrolledCoursesFetcher
  const {
    enrolledCourses,
    loadingEnrolledCourses, // <-- Destructure the already renamed prop
    enrolledCoursesError,   // <-- Destructure the already renamed prop
    refetchEnrolledCourses  // <-- Destructure the already renamed prop
  } = useEnrolledCoursesFetcher(user?.uid);

  // The value provided to consumers
  // Now, simply pass the destructured values directly
  const value = {
    enrolledCourses,
    loadingEnrolledCourses, // Use directly
    enrolledCoursesError,   // Use directly
    refetchEnrolledCourses
  };

  return (
    <EnrolledCoursesContext.Provider value={value}>
      {children}
    </EnrolledCoursesContext.Provider>
  );
};

EnrolledCoursesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Export the context itself for specific use cases (less common)
export default EnrolledCoursesContext;