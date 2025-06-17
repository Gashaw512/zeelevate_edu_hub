// src/context/EnrolledCoursesContext.js
import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext'; // Assuming AuthContext is defined here
import useEnrolledCoursesFetcher from '../hooks/useEnrolledCoursesFetcher';


const EnrolledCoursesContext = createContext(null);

export const useEnrolledCourses = () => {
  const context = useContext(EnrolledCoursesContext);
  if (context === undefined) {
    throw new Error('useEnrolledCourses must be used within an EnrolledCoursesProvider');
  }
  return context;
};


export const EnrolledCoursesProvider = ({ children }) => {
  const { user } = useAuth(); // Get user from AuthContext

  const {
    enrolledCourses,
    loadingEnrolledCourses,
    enrolledCoursesError,
    refetchEnrolledCourses
  } = useEnrolledCoursesFetcher(user?.uid); // This is where the hook is called

  const value = {
    enrolledCourses,
    loadingEnrolledCourses,
    enrolledCoursesError,
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

export default EnrolledCoursesContext;