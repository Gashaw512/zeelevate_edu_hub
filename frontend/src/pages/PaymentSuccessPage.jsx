// src/pages/PaymentSuccess.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Import the CSS module
import styles from './PaymentSuccess.module.css';

/**
 * PaymentSuccess Component
 * Handles post-payment registration and auto-login using a provided token.
 */
export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [status, setStatus] = useState('initial'); // 'initial', 'processing', 'success', 'error'
  const [error, setError] = useState(null);

  // --- Backend API Base URL ---
  // Ensure VITE_BACKEND_URL is defined in your .env file
  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL;

  const completeRegistrationAndLogin = useCallback(async () => {
    setStatus('processing');
    setError(null);

    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setError('Registration token is missing. Please contact support if you believe this is an error.');
      setStatus('error');
      return;
    }

    try {
      const registerResponse = await fetch(`${BACKEND_API_URL}/api/users/register-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.error || `Server registration failed (${registerResponse.status}).`);
      }

      const { email, password } = await registerResponse.json();

      if (!email || !password) {
        throw new Error('Missing login credentials from server response. Please contact support.');
      }

      await login(email, password);

      setStatus('success');

    } catch (err) {
      console.error('PaymentSuccess Process Error:', err);
      let userFriendlyMessage = 'An unexpected error occurred during registration or login.';

      if (err instanceof TypeError && err.message.includes('network')) {
        userFriendlyMessage = 'Network error. Please check your internet connection and try again.';
      } else if (err.message.includes('Server registration failed')) {
        userFriendlyMessage = `Registration failed: ${err.message}. The token might be invalid or expired.`;
      } else if (err.message.includes('Missing login credentials')) {
        userFriendlyMessage = err.message;
      } else if (err.code && err.code.startsWith('auth/')) {
        userFriendlyMessage = 'Authentication failed during auto-login. Please try logging in manually.';
      }

      setError(userFriendlyMessage);
      setStatus('error');
    }
  }, [location.search, login, BACKEND_API_URL]);

  useEffect(() => {
    if (status === 'initial') {
      completeRegistrationAndLogin();
    }
  }, [status, completeRegistrationAndLogin]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/student/dashboard/profile', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.cardBox}>
        {status === 'processing' && (
          <LoadingSpinner message="Completing your registration and setting up your account..." />
        )}

        {status === 'success' && (
          <>
            <FaCheckCircle className={`${styles.iconGreen} ${styles.iconBase} ${styles.animateBounceOnce}`} />
            <h1 className={`${styles.headingBase} ${styles.headingDark}`}>Registration Complete!</h1>
            <p className={`${styles.paragraphBase}`}>
              You're all set. Redirecting to your dashboard shortly...
            </p>
            <div className={`${styles.paragraphSmall}`}>
              If you are not redirected, click <button onClick={() => navigate('/dashboard/profile', { replace: true })} className={styles.inlineLinkButton}>here</button>.
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <FaExclamationTriangle className={`${styles.iconRed} ${styles.iconBase}`} />
            <h1 className={`${styles.headingBase} ${styles.headingRed}`}>Registration Failed</h1>
            <p className={`${styles.paragraphBase} ${styles.paragraphGray700}`}>{error}</p>
            <button
              onClick={() => completeRegistrationAndLogin()}
              className={styles.buttonBase}
            >
              Try Again
            </button>
            <p className={`${styles.paragraphSmall} ${styles.paragraphGray700} ${styles.mt4}`}>
              If the issue persists, please contact support.
            </p>
          </>
        )}
      </div>
    </div>
  );
}