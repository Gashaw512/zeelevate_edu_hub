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
import { FcGoogle } from 'react-icons/fc';
import { FaLinkedin } from 'react-icons/fa';
import './SignUp.css';
import logo from "/images/zel.jpg"; 

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

  const externalProviders = [
    {
      name: 'Google',
      icon: <FcGoogle className="mr-2 h-5 w-5" />,
      label: 'Continue with Google',
      onClick: handleGoogleSignUp
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin className="mr-2 h-5 w-5 text-blue-700" />,
      label: 'Continue with LinkedIn',
      onClick: handleLinkedInSignUp
    }
  ];

  return (
    <div className="sign-in-container">
      <div className="logo">
        <img src={logo} alt="Zeelevate Logo" /> 
      </div>
      
      <h2 className="welcome-text">Welcome</h2>
      <p className="login-instruction">Sign up to Zeelevate Academy to continue your learning journey</p>

      <form onSubmit={handleSignUp} className="form-container">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
        />
        <button type="submit" className="button">Register</button>
      </form>

      <p className="sign-up">Already have an account? <a href="/signin" className="link">Sign In</a></p>
      
      <div className="divider">OR</div>

      <div className="external-signin">
        <div className="social-auth-container">
          {externalProviders.map((provider) => (
            <button
              key={provider.name}
              className={`social-auth-button ${provider.name.toLowerCase()}-button`}
              onClick={provider.onClick}
            >
              {provider.icon}
              {provider.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignUp;