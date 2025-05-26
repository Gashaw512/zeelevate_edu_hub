import { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailPasswordSignIn } from '../utils/authService';
import { useAuth } from '../context/AuthContext';

const useSignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);
    const { success, error: signInError } = await emailPasswordSignIn(formData.email, formData.password);
    setIsSubmitting(false);
    if (success) {
      return; // AuthContext handles navigation
    } else {
      setError(signInError || 'Failed to sign in.');
    }
  };

  return { formData, error, isSubmitting, handleChange, handleSubmit };
};

export default useSignIn;