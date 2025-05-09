import React, { useState, useEffect } from 'react'; // Import useEffect
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Import useAuth
import "./SignIn.css";

const provider = new GoogleAuthProvider();

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the user state from AuthContext

  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    if (user) {
      navigate('/student/dashboard');
    }
  }, [user, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The useEffect above will handle the navigation once the user state updates
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      // The useEffect above will handle the navigation once the user state updates
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLinkedInLogin = () => {
    alert('LinkedIn sign-in will require backend OAuth integration.');
  };

  return (
    <div className="auth-container sign-in-container">
      <h2>Sign In</h2>
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
      </form>

      <div className="social-auth-container">
        <button className="social-auth-button google-button" onClick={handleGoogleLogin}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 2c-2.21 0-4.21.9-5.65 2.35l-1.5-1.5c1.51-1.52 3.5-2.35 6.15-2.35 4.73 0 8.55 3.87 8.55 8.65s-3.83 8.65-8.55 8.65c-2.99 0-5.56-1.55-7.07-3.81l1.5-1.5c1.06 1.15 2.59 1.89 3.57 1.89 2.93 0 5.32-2.34 5.32-5.33 0-2.93-2.34-5.33-5.32-5.33z" />
          </svg>
          Sign in with Google
        </button>
        <button className="social-auth-button linkedin-button" onClick={handleLinkedInLogin}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M4.98 3.5c0-.3-.3-.5-.6-.5h-.9c-.3 0-.5.2-.5.5v16c0 .3.3.5.5.5h.9c.3 0 .6-.2.6-.5v-16zM12.15 4c-1.64 0-2.99 1.35-2.99 2.99v9.99c0 1.65 1.35 2.99 2.99 2.99 1.64 0 2.99-1.34 2.99-2.99v-9.99c0-1.64-1.35-2.99-2.99-2.99zm0 12c-.55 0-.99-.44-.99-.99v-6.99c0-.55.44-.99.99-.99.55 0 .99.44.99.99v6.99c0 .55-.44.99-.99.99z" />
          </svg>
          Sign in with LinkedIn (Mock)
        </button>
      </div>

      <div className="auth-links">
        <a href="/forgot-password">Forgot Password?</a>
        <span> • </span>
        <a href="/signup">Create Account</a>
      </div>
    </div>
  );
};

export default SignIn;