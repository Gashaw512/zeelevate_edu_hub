// src/context/EnrolledCoursesContext.js
import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import useEnrolledCoursesFetcher from '../hooks/useEnrolledCoursesFetcher';

const EnrolledCoursesContext = createContext(undefined); // changed from null for stricter checking

export const useEnrolledCourses = () => {
  const context = useContext(EnrolledCoursesContext);
  if (context === undefined) {
    throw new Error('useEnrolledCourses must be used within an EnrolledCoursesProvider');
  }
  return context;
};

export const EnrolledCoursesProvider = ({ children }) => {
  const { user } = useAuth();

  const isLoggedIn = Boolean(user?.uid);

  const {
    enrolledCourses,
    loadingEnrolledCourses,
    enrolledCoursesError,
    refetchEnrolledCourses,
  } = isLoggedIn
    ? useEnrolledCoursesFetcher(user.uid)
    : {
        enrolledCourses: [],
        loadingEnrolledCourses: false,
        enrolledCoursesError: null,
        refetchEnrolledCourses: () => {},
      };

  const value = {
    enrolledCourses,
    loadingEnrolledCourses,
    enrolledCoursesError,
    refetchEnrolledCourses,
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
