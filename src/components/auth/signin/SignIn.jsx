import React, { useState, useEffect } from 'react'; 
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom'; 
import { auth } from '../../../firebase/auth'; 
import { useAuth } from '../../../context/AuthContext'; 
import { FcGoogle } from 'react-icons/fc'; 
import { FaLinkedin } from 'react-icons/fa'; 
import './SignIn.css'; 
import logo from "/images/zel.jpg"; 

const provider = new GoogleAuthProvider(); 

const SignIn = () => { 
  const [formData, setFormData] = useState({ email: '', password: '' }); 
  const [error, setError] = useState(''); 
  const navigate = useNavigate(); 
  const { user } = useAuth(); 

  useEffect(() => { 
    if (user) { 
      navigate('/student/dashboard'); 
    } 
  }, [user, navigate]); 

  const handleChange = (e) => { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
  }; 

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    setError(''); 
    try { 
      await signInWithEmailAndPassword(auth, formData.email, formData.password); 
    } catch (err) { 
      setError(err.message || 'Failed to sign in.'); 
    } 
  }; 

  const handleGoogleLogin = async () => { 
    setError(''); 
    try { 
      await signInWithPopup(auth, provider); 
    } catch (err) { 
      setError(err.message || 'Google sign-in failed.'); 
    } 
  }; 

  const handleLinkedInLogin = () => { 
    setError('LinkedIn sign-in is not yet implemented.'); 
  }; 

  const handleExternalSignIn = (providerName) => { 
    if (providerName === 'Google') { 
      handleGoogleLogin(); 
    } else if (providerName === 'LinkedIn') { 
      handleLinkedInLogin(); 
    } 
  }; 

  const externalProviders = [ 
    { name: 'Google', icon: <FcGoogle className="mr-2 h-5 w-5" />, label: 'Continue with Google' }, 
    { name: 'LinkedIn', icon: <FaLinkedin className="mr-2 h-5 w-5 text-blue-700" />, label: 'Continue with LinkedIn' } 
  ]; 

  return ( 
    <div className="sign-in-container"> 
      <div className="logo"> 
        <img src={logo} alt="Zeelevate Logo" /> 
      </div> 
      <h2 className="welcome-text">Welcome</h2> 
      <p className="login-instruction">Login to Zeelevate Academy to continue your learning journey</p> 

      <form onSubmit={handleSubmit} className="form-container"> 
        <div className="input-container"> 
          <input 
            type="email" 
            name="email" 
            placeholder="you@example.com" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            className="input" 
          /> 
        </div> 
        <div className="input-container"> 
          <input 
            type="password" 
            name="password" 
            placeholder="••••••••" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            className="input" 
          /> 
        </div> 
        <button type="submit" className="button">Login</button> 
      </form> 

      {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>} 

      <div className="forgot-password"> 
        <a href="/reset-password" className="link">Forgot Password?</a> 
      </div> 

      <div className="sign-up"> 
        <p>Do not have an account? <a href="/signup" className="link">Sign Up</a></p> 
      </div> 

      <div className="divider"> 
        <span className="divider-text">OR</span> 
      </div> 

      <div className="external-signin"> 
        <div className="social-auth-container"> 
          {externalProviders.map((provider) => ( 
            <button 
              key={provider.name} 
              onClick={() => handleExternalSignIn(provider.name)} 
              className={`social-auth-button ${provider.name.toLowerCase()}-button`} 
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

export default SignIn;