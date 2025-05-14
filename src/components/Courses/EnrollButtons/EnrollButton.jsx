// 📁 src/components/EnrollButtons/EnrollButton.jsx
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth"; // Uncomment when auth is ready
import "./EnrollButton.css"; // Optional for styling

const EnrollButton = ({ course, label }) => {
  const navigate = useNavigate();
  // const { currentUser } = useAuth(); // Integrate when Firebase is ready

  const handleEnroll = () => {
    const courseId = course.id;

    // Placeholder auth check — replace with actual logic when using Firebase
    const currentUser = true;

    if (!currentUser) {
      navigate("/auth", { state: { returnTo: `/courses/${courseId}` } });
      return
    }

    // Navigate to payment or enrollment confirmation
    navigate(`/payment/${courseId}`, {
      state: { course },
    });
  };

  return (
    <button className="enroll-button" onClick={handleEnroll}>
      {label || `Enroll Now - $${course.price}`}
    </button>
  );
};

export default EnrollButton;
