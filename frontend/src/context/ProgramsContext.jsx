// src/context/ProgramsContext.jsx
import  { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import useProgramsFetcher from '../hooks/useProgramsFetcher'; // Your existing hook

// Create the context
const ProgramsContext = createContext(null);

// Custom hook to consume the context
export const usePrograms = () => {
  const context = useContext(ProgramsContext);
  if (context === undefined) {
    throw new Error('usePrograms must be used within a ProgramsProvider');
  }
  return context;
};

// Provider component
export const ProgramsProvider = ({ children }) => {
  // Pass the backend URL directly to the hook, which will then use it
  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL;
  const {
    programs,
    loading,
    error,
    refetchPrograms
  } = useProgramsFetcher(BACKEND_API_URL); // The hook itself handles the fetch and memoization

  // The value provided to consumers
  const value = {
    programs,
    loadingPrograms: loading,   // Renamed for clarity in consumption
    programsError: error,       // Renamed for clarity in consumption
    refetchPrograms: refetchPrograms
  };

  return (
    <ProgramsContext.Provider value={value}>
      {children}
    </ProgramsContext.Provider>
  );
};

ProgramsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProgramsContext;