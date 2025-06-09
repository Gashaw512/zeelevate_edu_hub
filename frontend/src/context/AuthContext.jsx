import { createContext, useContext, useEffect, useState, useCallback  } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';

const AuthContext = createContext();

// Session timeout duration (30 minutes)
const SESSION_TIMEOUT = 20 * 60 * 1000; // 30 minutes in milliseconds

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [logoutTimer, setLogoutTimer] = useState(null);

  // Function to set the logout timer
  const setAutoLogoutTimer = useCallback(() => {
    // Clear any existing timer
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT);

    setLogoutTimer(timer);
  }, [logoutTimer]);

  // Function to reset the logout timer on user activity
  const resetLogoutTimer = useCallback(() => {
    setAutoLogoutTimer();
  }, [setAutoLogoutTimer]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetLogoutTimer();

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, resetLogoutTimer]);

  // Handle storage event for cross-tab logout
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'logout' && e.newValue) {
        logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Main auth state change handler
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if there's a stored session expiry
        const storedExpiry = localStorage.getItem('sessionExpiry');
        const now = new Date().getTime();

        if (storedExpiry && now > parseInt(storedExpiry)) {
          // Session expired
          await logout();
          return;
        }

        // Clear any previous authentication errors
        setAuthError(null);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() });
          } else {
            setUser(firebaseUser);
            console.warn("User document not found for UID:", firebaseUser.uid);
          }
          
          // Set session expiry in localStorage
          const expiryTime = new Date().getTime() + SESSION_TIMEOUT;
          localStorage.setItem('sessionExpiry', expiryTime.toString());
          
          // Set auto logout timer
          setAutoLogoutTimer();
        } catch (dbError) {
          console.error('Error fetching user document:', dbError);
          setAuthError("Failed to load user data.");
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
        localStorage.removeItem('sessionExpiry');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setAutoLogoutTimer]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      const errorCode = error.code;
      let errorMessage = 'Login failed. Please check your credentials.';

      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (errorCode === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      }

      setAuthError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      // Clear session data
      localStorage.removeItem('sessionExpiry');
      localStorage.removeItem('token');
      
      // Clear logout timer
      if (logoutTimer) {
        clearTimeout(logoutTimer);
        setLogoutTimer(null);
      }
      
      // Trigger logout in other tabs
      localStorage.setItem('logout', Date.now());
      
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError("Failed to log out. Please try again.");
      throw error;
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const firebaseUser = auth.currentUser;

      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ ...firebaseUser, ...userDoc.data() });
        } else {
          setUser(firebaseUser);
        }
      } catch (dbError) {
        console.error('Error refreshing user document:', dbError);
        setUser(firebaseUser);
      }
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      setAuthError,
      login,
      logout,
      clearAuthError,
      refreshUser,
      resetLogoutTimer, // Expose this for manual reset if needed
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};