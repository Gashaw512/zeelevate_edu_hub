// src/hooks/useAuth.js
import { useEffect, useState, createContext, useContext } from "react"; // Import createContext and useContext
import { auth } from "../firebase/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(""); // State for authentication errors

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setError = (message) => {
    setAuthError(message);
  };

  const value = {
    user,
    loading,
    authError,
    setError, // Provide the setError function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};