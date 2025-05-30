import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null); // <--- Add this state for auth errors

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Clear any previous authentication errors on successful login/state change
        setAuthError(null);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, ...userDoc.data() });
          } else {
            // Handle case where user document might not exist (e.g., new social login)
            setUser(firebaseUser);
            console.warn("User document not found for UID:", firebaseUser.uid);
          }
        } catch (dbError) {
          console.error('Error fetching user document:', dbError);
          // Set an error if fetching user data fails
          setAuthError("Failed to load user data.");
          setUser(firebaseUser); // Still set firebaseUser to allow some functionality
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

const login = async (email, password) => {
    setAuthError(null); // Clear previous errors before attempting login
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // If successful, onAuthStateChanged will trigger and handle user state
    } catch (error) {
      console.error('Login error:', error); 

      const errorCode = error.code;
      let errorMessage = 'Login failed. Please check your credentials.'; // Default message

      // Improved user-friendly messages based on Firebase error codes
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.'; // <--- This should catch 'auth/invalid-credential'
      } else if (errorCode === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      }

      setAuthError(errorMessage); // <--- This is where the user-friendly message is set in context
      throw error; // Re-throw the error so `useSignIn` can catch it if needed, though often not strictly necessary if context handles display.
    }
  };

  const logout = async () => {
    setAuthError(null); // Clear errors on logout
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError("Failed to log out. Please try again.");
      throw error; // Re-throw the error if calling component needs to handle it
    }
  };

  // Function to manually clear auth errors if needed from other components
  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, setAuthError, login, logout, clearAuthError }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};