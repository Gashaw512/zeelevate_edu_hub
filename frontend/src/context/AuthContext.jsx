import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react'; // Import useMemo and useRef
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';
import LoadingSpinner from '../components/common/LoadingSpinner'; // Assuming this is a proper component

const AuthContext = createContext();

// Session timeout duration (30 minutes)
const SESSION_TIMEOUT = 20 * 60 * 1000; // 30 minutes in milliseconds

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Use a ref for the logout timer ID to avoid it being a dependency in useCallback
  const logoutTimerRef = useRef(null);

  // --- Start of Memoized Function Definitions ---
  // Memoize logout function
  const logout = useCallback(async () => {
    setAuthError(null);
    try {
      // Clear session data
      localStorage.removeItem('sessionExpiry');
      localStorage.removeItem('token'); // Assuming you use a token

      // Clear the timer stored in the ref
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }

      // Trigger logout in other tabs
      localStorage.setItem('logout', Date.now().toString());

      await signOut(auth);
      setUser(null);
      console.log("AuthContext: User logged out.");
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      setAuthError("Failed to log out. Please try again.");
      throw error;
    }
  }, []); // Dependencies are empty because it accesses ref for timer and uses stable auth/localStorage

  // Memoize setAutoLogoutTimer
  const setAutoLogoutTimer = useCallback(() => {
    // Clear any existing timer using the ref
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }

    const timer = setTimeout(() => {
      console.log("AuthContext: Auto-logout triggered.");
      logout(); // Use the memoized logout function
    }, SESSION_TIMEOUT);

    logoutTimerRef.current = timer; // Store the new timer ID in the ref
  }, [logout]); // Only depends on 'logout' function, which is stable now.

  // Memoize resetLogoutTimer
  const resetLogoutTimer = useCallback(() => {
    setAutoLogoutTimer();
  }, [setAutoLogoutTimer]); // Depends on setAutoLogoutTimer (which is stable)

  // Memoize login function
  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("AuthContext: Login successful.");
      // onAuthStateChanged will handle setting user and starting timer
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

  // Memoize refreshUser function
  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        const firebaseUser = auth.currentUser;
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ ...firebaseUser, ...userDoc.data() });
          console.log("AuthContext: User data refreshed from Firestore.");
        } else {
          setUser(firebaseUser);
          console.warn("AuthContext: User document not found during refresh for UID:", firebaseUser.uid);
        }
      } catch (dbError) {
        console.error('AuthContext: Error refreshing user document:', dbError);
        setUser(auth.currentUser); // Still set firebase user even if doc fetch fails
      }
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);
  // --- End of Memoized Function Definitions ---


  // --- useEffects for AuthContext Logic ---

  // Set up event listeners for user activity to reset logout timer
  useEffect(() => {
    if (!user) { // Only listen for activity if a user is logged in
      // Also ensure timer is cleared if user logs out or is not logged in
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

    // Start timer on login or first activity
    setAutoLogoutTimer();

    return () => {
      console.log("AuthContext: Removing activity listeners.");
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      // Clear timer on component unmount or dependency change clean-up
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [user, resetLogoutTimer, setAutoLogoutTimer]); // Dependencies are stable callbacks and user state

  // Handle storage event for cross-tab logout
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'logout' && e.newValue && user) {
        console.log("AuthContext: Storage event - initiating logout due to other tab.");
        logout(); // Use the memoized logout function
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, logout]); // Depends on user and logout function

  // Main auth state change handler (Firebase listener)
  useEffect(() => {
    console.log("AuthContext: onAuthStateChanged useEffect triggered.");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AuthContext: onAuthStateChanged callback fired. firebaseUser:", firebaseUser ? firebaseUser.uid : "None");

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
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() });
            console.log("AuthContext: User data loaded from Firestore.");
          } else {
            setUser(firebaseUser);
            console.warn("AuthContext: User document not found for UID:", firebaseUser.uid);
          }

          const expiryTime = new Date().getTime() + SESSION_TIMEOUT;
          localStorage.setItem('sessionExpiry', expiryTime.toString());
          setAutoLogoutTimer(); // Use the memoized setAutoLogoutTimer function

        } catch (dbError) {
          console.error('AuthContext: Error fetching user document:', dbError);
          setAuthError("Failed to load user data.");
          setUser(firebaseUser); // Still set firebase user even if doc fetch fails
        }
      } else {
        setUser(null);
        localStorage.removeItem('sessionExpiry');
        console.log("AuthContext: No Firebase user detected. User set to null.");
      }
      setLoading(false); // Auth state determination complete
    });

    return () => {
        console.log("AuthContext: Unsubscribing from onAuthStateChanged.");
        unsubscribe();
        // The logout timer is handled by the activity effect's cleanup and the logout function itself.
    };
  }, [logout, setAutoLogoutTimer]); // Dependencies: stable logout and setAutoLogoutTimer functions


  // --- CRITICAL FIX: Memoize the context value ---
  // This ensures the 'value' object itself only changes its reference if its dependencies change.
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
  // Dependencies: Include all values/functions that are part of the context value.
  // Since all functions are wrapped in useCallback, their references are stable.


  // Optional: Add debug logs for the provider's actual re-renders
  const providerRenderCount = useRef(0);
  providerRenderCount.current = providerRenderCount.current + 1;
  console.log(`%cAuthContext.Provider rendered (Count: ${providerRenderCount.current}). User UID: ${user ? user.uid : 'null'}, Loading: ${loading}`, 'color: blue;');


  return (
    <AuthContext.Provider value={authContextValue}>
      {/* Conditionally render children only when authentication is no longer loading.
          This prevents components from trying to fetch data before auth state is known. */}
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