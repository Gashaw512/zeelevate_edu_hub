import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth'; // Import signInWithEmailAndPassword
import { doc, getDoc } from 'firebase/firestore';

import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        setUser({ ...firebaseUser, ...userDoc.data() });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener above will automatically trigger and update the user state
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw the error so the SignIn component can handle it
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}> {/* Include login in the value */}
      {!loading && children}
    </AuthContext.Provider>
  );
};