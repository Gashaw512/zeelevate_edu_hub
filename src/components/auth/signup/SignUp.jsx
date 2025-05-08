import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../../../firebase/auth';
import { db } from '../../../firebase/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const provider = new GoogleAuthProvider();

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        name,
        role: 'student'
      });
      alert('Registration successful');
      navigate('/student/dashboard');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        role: 'student'
      });

      navigate('/student/dashboard');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLinkedInSignUp = () => {
    alert('LinkedIn signup will require backend OAuth integration.');
  };

  return (
    <div className="auth-container sign-up-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <button type="submit">Register</button>
      </form>

      <div className="social-auth-container">
        <button className="social-auth-button google-button" onClick={handleGoogleSignUp}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 2c-2.21 0-4.21.9-5.65 2.35l-1.5-1.5c1.51-1.52 3.5-2.35 6.15-2.35 4.73 0 8.55 3.87 8.55 8.65s-3.83 8.65-8.55 8.65c-2.99 0-5.56-1.55-7.07-3.81l1.5-1.5c1.06 1.15 2.59 1.89 3.57 1.89 2.93 0 5.32-2.34 5.32-5.33 0-2.93-2.34-5.33-5.32-5.33z" />
          </svg>
          Sign up with Google
        </button>

        <button className="social-auth-button linkedin-button" onClick={handleLinkedInSignUp}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M4.98 3.5c0-.3-.3-.5-.6-.5h-.9c-.3 0-.5.2-.5.5v16c0 .3.3.5.5.5h.9c.3 0 .6-.2.6-.5v-16zM12.15 4c-1.64 0-2.99 1.35-2.99 2.99v9.99c0 1.65 1.35 2.99 2.99 2.99 1.64 0 2.99-1.34 2.99-2.99v-9.99c0-1.64-1.35-2.99-2.99-2.99zm0 12c-.55 0-.99-.44-.99-.99v-6.99c0-.55.44-.99.99-.99.55 0 .99.44.99.99v6.99c0 .55-.44.99-.99.99z" />
          </svg>
          Sign up with LinkedIn
        </button>
      </div>

      <div className="auth-links">
        <a href="/signin">Already have an account? Sign In</a>
      </div>
    </div>
  );
};

export default SignUp;
