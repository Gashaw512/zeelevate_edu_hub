// src/components/SessionChecker/SessionChecker.jsx
import { useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SessionChecker = () => {
  const { isAuthenticated, logout } = useAuth(); 
  const navigate = useNavigate(); 

  const checkSession = useCallback(() => {
    // Only proceed if the user is currently authenticated
    if (!isAuthenticated) {
      return;
    }

    const tokenExpiry = localStorage.getItem('tokenExpiry');

    if (!tokenExpiry) {
   
      console.warn("SessionChecker: No 'tokenExpiry' found in localStorage while user is authenticated. Logging out for consistency.");
      logout();
      return;
    }

    const now = Date.now(); 
    const expiryTime = parseInt(tokenExpiry, 10);

    if (now > expiryTime) {
      console.log('Session expired. Logging out user.');
      logout();
      
      navigate('/login'); 
    }
  }, [isAuthenticated, logout, navigate]); 

  useEffect(() => {
    
    checkSession();

    const intervalId = setInterval(checkSession, 300000); 

    return () => clearInterval(intervalId);
  }, [checkSession]); 

  return null;
};

export default SessionChecker;