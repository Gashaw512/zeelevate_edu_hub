import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const SessionChecker = () => {
  const { logout } = useAuth();

  useEffect(() => {
    const checkSession = () => {
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      const now = new Date().getTime();
      
      if (tokenExpiry && now > parseInt(tokenExpiry)) {
        logout();
      }
    };

    // Check on initial load
    checkSession();
    
    // Check periodically (every minute)
    const interval = setInterval(checkSession, 60000);
    
    return () => clearInterval(interval);
  }, [logout]);

  return null;
};

export default SessionChecker;