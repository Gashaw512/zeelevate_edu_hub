// This new context will house your useEnrolledCoursesFetcher hook and provide its data to consuming components.
import  { createContext, useContext } from 'react';
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
  const {
    enrolledCourses,
    loadingEnrollments,
    enrollmentsError,
    refetchEnrollments // Expose refetch if components might need to trigger a refresh
  } = useEnrolledCoursesFetcher(user?.uid);

  // The value provided to consumers
  const value = {
    enrolledCourses,
    loadingEnrolledCourses: loadingEnrollments, // Renamed for clarity in consumption
    enrolledCoursesError: enrollmentsError,     // Renamed for clarity in consumption
    refetchEnrolledCourses: refetchEnrollments
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