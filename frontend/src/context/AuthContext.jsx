// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';

const AuthContext = createContext();
const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const logoutTimerRef = useRef(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const logout = useCallback(async () => {
    setAuthError(null);
    try {
      clearLogoutTimer();
      localStorage.removeItem('sessionExpiry');
      localStorage.removeItem('token');
      localStorage.setItem('logout', Date.now().toString());
      await signOut(auth);
      console.log('AuthContext: User logged out.');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      setAuthError('Failed to log out. Please try again.');
      throw error;
    }
  }, []);

  const setAutoLogoutTimer = useCallback(() => {
    clearLogoutTimer();
    logoutTimerRef.current = setTimeout(() => {
      console.log('AuthContext: Auto-logout triggered.');
      logout();
    }, SESSION_TIMEOUT);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: Login successful.');
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      let message = 'Login failed. Please check your credentials.';
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          message = 'Invalid email or password.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/invalid-email':
          message = 'The email address is not valid.';
          break;
      }
      setAuthError(message);
      throw error;
    }
  }, []);

  const deepCompareUser = useCallback((oldUser, newUser) => {
    if (oldUser === newUser) return true;
    if (!oldUser || !newUser) return false;

    if (
      oldUser.uid !== newUser.uid ||
      oldUser.email !== newUser.email ||
      oldUser.displayName !== newUser.displayName ||
      oldUser.photoURL !== newUser.photoURL
    ) {
      return false;
    }

    if (oldUser.role !== newUser.role) {
      return false;
    }

    return true;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const firestoreData = userDoc.exists() ? userDoc.data() : {};
          const combinedUser = { ...firebaseUser, ...firestoreData };

          setUser((prevUser) => {
            if (deepCompareUser(prevUser, combinedUser)) {
              return prevUser;
            }
            return combinedUser;
          });

          const expiryTime = Date.now() + SESSION_TIMEOUT;
          localStorage.setItem('sessionExpiry', expiryTime.toString());
          setAutoLogoutTimer();
          setAuthError(null);
        } catch (error) {
          console.error('AuthContext: Failed to fetch user Firestore data', error);
          setUser(firebaseUser);
          setAuthError('Failed to load user data.');
        }
      } else {
        setUser(null);
        localStorage.removeItem('sessionExpiry');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deepCompareUser, setAutoLogoutTimer]);

  useEffect(() => {
    if (!user) {
      clearLogoutTimer();
      return;
    }

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const resetTimer = () => setAutoLogoutTimer();

    activityEvents.forEach((event) => window.addEventListener(event, resetTimer));
    setAutoLogoutTimer();

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
      clearLogoutTimer();
    };
  }, [user, setAutoLogoutTimer]);

  useEffect(() => {
    const onStorageChange = (event) => {
      if (event.key === 'logout' && event.newValue && user) {
        logout();
      }
    };

    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, [logout, user]);

  const authContextValue = useMemo(
    () => ({
      user,
      loading,
      authError,
      login,
      logout,
      clearAuthError: () => setAuthError(null),
      resetLogoutTimer: setAutoLogoutTimer,
    }),
    [user, loading, authError, login, logout, setAutoLogoutTimer]
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
