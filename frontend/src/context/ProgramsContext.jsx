// src/context/ProgramsContext.jsx
import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import useProgramsFetcher from '../hooks/useProgramsFetcher'; // Import the corrected hook

// Create the context. It's a good practice to give it a default value, even if null.
const ProgramsContext = createContext(null);

/**
 * Custom hook to consume the ProgramsContext.
 * Ensures that `usePrograms` is always used within a `ProgramsProvider`.
 * @returns {object} The context value containing programs, courses, and related states.
 */
export const usePrograms = () => {
  const context = useContext(ProgramsContext);
  if (context === undefined) {
    throw new Error('usePrograms must be used within a ProgramsProvider');
  }
  return context;
};

/**
 * ProgramsProvider component.
 * It's responsible for fetching all public programs and courses
 * and making them available to any descendant components via Context.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The child components that will consume the context.
 */
export const ProgramsProvider = ({ children }) => {
  // Ensure VITE_BACKEND_URL is correctly set in your .env file (e.g., VITE_BACKEND_URL=http://localhost:3001/api)
  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL;
  
  // Use the useProgramsFetcher hook to get programs, allCourses, and their loading/error states.
  const {
    programs,
    allCourses,      // Get allCourses from the fetcher
    loading,
    error,
    refetchPrograms
  } = useProgramsFetcher(BACKEND_API_URL);

  // The value object provided to any component that uses `usePrograms()`.
  const value = {
    programs,          // The list of public programs
    allCourses,        // The list of all public courses
    loadingPrograms: loading,   // Consistent naming for loading state
    programsError: error,       // Consistent naming for error state
    refetchPrograms: refetchPrograms // Function to allow manual re-fetching
  };

  return (
    <ProgramsContext.Provider value={value}>
      {children}
    </ProgramsContext.Provider>
  );
};

// PropTypes for validation (good practice for reusability)
ProgramsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProgramsContext;