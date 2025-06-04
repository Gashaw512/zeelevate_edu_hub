import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { auth } from '../firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState(null);

  useEffect(() => {
    const completeRegistration = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setError('Missing registration token.');
        setStatus('error');
        return;
      }

      try {
        setStatus('registering');

        // 🔁 Call backend to complete registration with token
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/register-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Registration failed on server.');
        }

        const { email, password } = await response.json();

        // ✅ Auto login
        await signInWithEmailAndPassword(auth, email, password);

        setStatus('success');
      } catch (err) {
        console.error('Registration/Login error:', err);
        setError(err.message || 'Something went wrong.');
        setStatus('error');
      }
    };

    completeRegistration();
  }, [location.search]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/student/dashboard');
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
            {status === 'verifying' ? 'Verifying payment...' : 'Registering and logging in...'}
          </p>
        </>
      ) : status === 'success' ? (
        <>
          <FaCheckCircle className="text-green-500 text-4xl mb-4" />
          <p className="text-xl font-semibold mb-2">Registration Complete!</p>
          <p className="text-sm text-gray-600">Redirecting to your dashboard...</p>
        </>
      ) : (
        <>
          <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
          <p className="text-xl font-semibold mb-2">Something went wrong</p>
          <p className="text-sm text-gray-600">{error}</p>
        </>
      )}
    </div>
  );
}

export const PaymentSuccessPage = PaymentSuccess;
