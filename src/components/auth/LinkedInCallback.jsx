// src/components/auth/LinkedInCallback.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { handleLinkedInCallback } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const LinkedInCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
      return;
    }

    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      navigate('/login', { state: { error: `LinkedIn login failed: ${error}` } });
      return;
    }

    if (code) {
      const authenticate = async () => {
        const { success, error } = await handleLinkedInCallback(code);
        if (success) {
          navigate('/');
        } else {
          navigate('/login', { state: { error } });
        }
      };
      authenticate();
    } else {
      navigate('/login', { state: { error: 'No authorization code received' } });
    }
  }, [location, navigate, user]);

  return (
    <div className="callback-container">
      <div className="loading-spinner"></div>
      <p>Authenticating with LinkedIn...</p>
    </div>
  );
};

export default LinkedInCallback;