// src/context/ProgramsContext.jsx

import { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import useProgramsFetcher from '../hooks/useProgramsFetcher';

const ProgramsContext = createContext(null);

/**
 * Custom hook to consume the ProgramsContext.
 * Ensures it's used within a valid provider.
 */
export const usePrograms = () => {
  const context = useContext(ProgramsContext);
  if (!context) {
    throw new Error('usePrograms must be used within a <ProgramsProvider>');
  }
  return context;
};

/**
 * Provider component for program/course data.
 * Wraps app sections needing access to program info.
 */
export const ProgramsProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const {
    programs,
    allCourses,
    loading,
    error,
    refetchPrograms,
  } = useProgramsFetcher(API_URL);

  const value = useMemo(
    () => ({
      programs,
      allCourses,
      loadingPrograms: loading,
      programsError: error,
      refetchPrograms,
    }),
    [programs, allCourses, loading, error, refetchPrograms]
  );

  return (
    <ProgramsContext.Provider value={value}>
      {children}
    </ProgramsContext.Provider>
  );
};

ProgramsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
