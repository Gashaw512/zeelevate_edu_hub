// src/context/ProgramsContext.jsx

import { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import useProgramsFetcher from '../hooks/useProgramsFetcher';

const ProgramsContext = createContext(null);

/**
 * Custom hook to access the ProgramsContext.
 * Throws an error if used outside of a ProgramsProvider.
 * @returns {object} Context values including programs, courses, and state flags.
 */
export const usePrograms = () => {
  const context = useContext(ProgramsContext);
  if (context === null) {
    throw new Error('usePrograms must be used within a ProgramsProvider');
  }
  return context;
};

/**
 * Provider component to fetch and supply program/course data to consumers.
 * Uses a custom hook to fetch data and exposes loading/error state.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Components that consume the context.
 */
export const ProgramsProvider = ({ children }) => {
  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL;

  const {
    programs,
    allCourses,
    loading,
    error,
    refetchPrograms,
  } = useProgramsFetcher(BACKEND_API_URL);

  const contextValue = useMemo(() => ({
    programs,
    allCourses,
    loadingPrograms: loading,
    programsError: error,
    refetchPrograms,
  }), [programs, allCourses, loading, error, refetchPrograms]);

  return (
    <ProgramsContext.Provider value={contextValue}>
      {children}
    </ProgramsContext.Provider>
  );
};

ProgramsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProgramsContext;
