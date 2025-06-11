import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AuthContext = createContext();
const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const logoutTimerRef = useRef(null);

  const logout = useCallback(async () => {
    setAuthError(null);
    try {
      localStorage.removeItem('sessionExpiry');
      localStorage.removeItem('token');

      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }

      localStorage.setItem('logout', Date.now().toString());

      await signOut(auth);
      // setUser(null) will be handled by onAuthStateChanged listener
      console.log("AuthContext: User logged out.");
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      setAuthError("Failed to log out. Please try again.");
      throw error;
    }
  }, []);

  const setAutoLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    const timer = setTimeout(() => {
      console.log("AuthContext: Auto-logout triggered.");
      logout();
    }, SESSION_TIMEOUT);

    logoutTimerRef.current = timer;
  }, [logout]);

  const resetLogoutTimer = useCallback(() => {
    setAutoLogoutTimer();
  }, [setAutoLogoutTimer]);

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("AuthContext: Login successful.");
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
  }, []);

  // Helper to compare user objects to prevent unnecessary state updates
  // This is the key optimization for 'user' state
  const deepCompareUser = useCallback((oldUser, newUser) => {
    if (oldUser === newUser) return true; // Same reference
    if (!oldUser || !newUser) return false; // One is null/undefined, other is not

    // Compare core Firebase properties
    if (oldUser.uid !== newUser.uid ||
        oldUser.email !== newUser.email ||
        oldUser.displayName !== newUser.displayName ||
        oldUser.photoURL !== newUser.photoURL) {
      return false;
    }

    // Compare Firestore data if present
    const oldUserData = oldUser.role; // Assuming role is the main data from Firestore
    const newUserData = newUser.role; // Compare relevant Firestore fields

    if (oldUserData !== newUserData) {
        return false;
    }

    // Add more granular checks for other potentially changing fields from userDoc.data()
    // For example:
    // if (oldUser.customField1 !== newUser.customField1) return false;
    // if (oldUser.lastLogin !== newUser.lastLogin) return false; // This one might actually change often!
    // Consider which fields truly warrant a re-render.

    return true; // No significant difference found
  }, []); // No dependencies for this helper

  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        const firebaseUser = auth.currentUser;
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userDataFromFirestore = userDoc.exists() ? userDoc.data() : {};
        const newUserState = { ...firebaseUser, ...userDataFromFirestore };

        // Only update user state if content has changed
        setUser(prevUser => {
          if (deepCompareUser(prevUser, newUserState)) {
            console.log("AuthContext: User data (content) is identical, skipping setUser update.");
            return prevUser; // Return previous state to avoid re-render
          }
          console.log("AuthContext: User data refreshed and content changed. Setting new user state.");
          return newUserState;
        });

      } catch (dbError) {
        console.error('AuthContext: Error refreshing user document:', dbError);
        // Even if Firestore fetch fails, keep the current Firebase user data
        setUser(prevUser => {
          if (deepCompareUser(prevUser, auth.currentUser)) {
            return prevUser;
          }
          return auth.currentUser;
        });
        setAuthError("Failed to refresh user data from database.");
      }
    }
  }, [deepCompareUser]); // Depends on deepCompareUser

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);


  useEffect(() => {
    if (!user) {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      return;
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetLogoutTimer();

    console.log("AuthContext: Attaching activity listeners.");
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    setAutoLogoutTimer();

    return () => {
      console.log("AuthContext: Removing activity listeners.");
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [user, resetLogoutTimer, setAutoLogoutTimer]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'logout' && e.newValue && user) {
        console.log("AuthContext: Storage event - initiating logout due to other tab.");
        logout();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, logout]);


  useEffect(() => {
    console.log("AuthContext: onAuthStateChanged useEffect triggered.");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AuthContext: onAuthStateChanged callback fired. firebaseUser:", firebaseUser ? firebaseUser.uid : "None");

      // Before doing anything, check if this user is logically the same as current user
      // to avoid unnecessary re-renders if onAuthStateChanged fires redundantly.
      if (firebaseUser) {
        const storedExpiry = localStorage.getItem('sessionExpiry');
        const now = new Date().getTime();

        if (storedExpiry && now > parseInt(storedExpiry)) {
          console.log("AuthContext: Session expired from localStorage. Logging out.");
          await logout();
          setLoading(false); // Ensure loading is false after expired session logout
          return;
        }

        setAuthError(null);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userDataFromFirestore = userDoc.exists() ? userDoc.data() : {};
          const newUserState = { ...firebaseUser, ...userDataFromFirestore };

          // CRITICAL: Only update user state if the content has changed
          setUser(prevUser => {
            if (deepCompareUser(prevUser, newUserState)) {
              console.log("AuthContext: Firebase user content is identical, skipping setUser update.");
              return prevUser; // Return previous state to avoid re-render
            }
            console.log("AuthContext: Firebase user changed. Setting new user state.");
            return newUserState;
          });

          const expiryTime = new Date().getTime() + SESSION_TIMEOUT;
          localStorage.setItem('sessionExpiry', expiryTime.toString());
          setAutoLogoutTimer();

        } catch (dbError) {
          console.error('AuthContext: Error fetching user document:', dbError);
          setAuthError("Failed to load user data.");
          // CRITICAL: Even if Firestore fetch fails, set the basic Firebase user if it's different
          setUser(prevUser => {
            if (deepCompareUser(prevUser, firebaseUser)) {
              return prevUser;
            }
            return firebaseUser;
          });
        }
      } else {
        // Only set to null if current user is not already null
        setUser(prevUser => {
            if (prevUser === null) {
                return null;
            }
            console.log("AuthContext: No Firebase user detected. Setting user to null.");
            return null;
        });
        localStorage.removeItem('sessionExpiry');
        console.log("AuthContext: No Firebase user detected. User set to null.");
      }
      setLoading(false);
    });

    return () => {
        console.log("AuthContext: Unsubscribing from onAuthStateChanged.");
        unsubscribe();
    };
  }, [logout, setAutoLogoutTimer, deepCompareUser]); // Add deepCompareUser to dependencies


  const authContextValue = useMemo(() => ({
    user,
    loading,
    authError,
    setAuthError,
    login,
    logout,
    clearAuthError,
    refreshUser,
    resetLogoutTimer,
  }), [user, loading, authError, login, logout, clearAuthError, refreshUser, resetLogoutTimer]);

  const providerRenderCount = useRef(0);
  providerRenderCount.current = providerRenderCount.current + 1;
  console.log(`%cAuthContext.Provider rendered (Count: ${providerRenderCount.current}). User UID: ${user ? user.uid : 'null'}, Loading: ${loading}`, 'color: blue;');


  return (
    <AuthContext.Provider value={authContextValue}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '15px' }}>
          <LoadingSpinner message="Initializing authentication..." />
          <p style={{fontSize: '1em', color: '#666'}}>Please wait while we secure your session.</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};