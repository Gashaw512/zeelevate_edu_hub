import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { db } from '../firebase/firestore';
import { collection, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const completeRegistration = async () => {
      const params = new URLSearchParams(location.search);
      const firstname = decodeURIComponent(params.get('firstname') || '');
      const lastname = decodeURIComponent(params.get('lastname') || '');
      const email = decodeURIComponent(params.get('email') || '');
      const password = decodeURIComponent(params.get('password') || '');
      const amount = parseFloat(params.get('amount') || 0);
      const course = decodeURIComponent(params.get('course') || '');
      const role = decodeURIComponent(params.get('role') || 'student');
      const courseId = params.get('courseId') || 'default';
      const orderId = params.get('orderId');

      if (!orderId || !email || !password) {
        setError('Missing required registration information.');
        setStatus('error');
        return;
      }

      try {
        setStatus('registering');

        // Register user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { uid } = userCredential.user;

        // Save to Firestore using uid
        await setDoc(doc(db, 'users', uid), {
          firstname,
          lastname,
          email,
          course,
          courseId,
          amount,
          orderId,
          createdAt: serverTimestamp(),
        });

        setUserData({
          firstname,
          lastname,
          email,
          course,
          amount,
          userId: uid,
        });

        setStatus('success');
      } catch (err) {
        console.error('Registration error:', err);
        if (err.code === 'auth/email-already-in-use') {
          setError('This email is already registered. Try logging in instead.');
        } else {
          setError(err.message);
        }
        setStatus('error');
      }
    };

    completeRegistration();
  }, [location.search]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/student/dashboard'); // change to '/login' if that's more appropriate
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      {status === 'verifying' || status === 'registering' ? (
        <>
          <FaSpinner className="animate-spin text-blue-500 text-4xl mb-4" />
          <p className="text-lg">
            {status === 'verifying' ? 'Verifying payment...' : 'Registering user...'}
          </p>
        </>
      ) : status === 'success' ? (
        <>
          <FaCheckCircle className="text-green-500 text-4xl mb-4" />
          <p className="text-xl font-semibold mb-2">Registration Successful!</p>
          <p className="text-sm text-gray-600">Redirecting to your dashboard...</p>
        </>
      ) : (
        <>
          <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
          <p className="text-xl font-semibold mb-2">Registration Failed</p>
          <p className="text-sm text-gray-600">{error}</p>
        </>
      )}
    </div>
  );
}

export const PaymentSuccessPage = PaymentSuccess; // For consistency with your routing structure