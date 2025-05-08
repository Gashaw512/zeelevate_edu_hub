// EnrollButton.jsx
// import { useAuth } from '../../hooks/useAuth'; // Your Firebase auth hook
import { useNavigate } from 'react-router-dom';

const EnrollButton = ({ courseId, priceId, price }) => {
//   const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleEnroll = () => {
    if (!currentUser) {
      navigate('/auth', { state: { returnTo: `/courses/${courseId}` } });
      return;
    }
    // Add your payment initiation logic here
    navigate(`/payment/${courseId}`);
  };

  return (
    <button 
      className="enroll-button"
      onClick={handleEnroll}
    >
      Enroll Now - ${price}
    </button>
  );
};

export default EnrollButton;