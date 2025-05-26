
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

   if (loading) {
    // Show a loading indicator while Firebase auth state is being determined
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <div className="text-xl text-gray-700">Authenticating...</div>
      </div>
    );
  }
  if (!user) {
    // User is not logged in, redirect to signin
    return <Navigate to="/signin" replace />;
  }
  // if (role && user.role !== role) return <Navigate to="/unauthorized" />;
    if (role && user.role !== role) {
    // User logged in but wrong role, redirect to a generic page or error
    return <Navigate to="/" replace />; // Or a permission denied page like /unauthorized
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.string, // Optional: only needed if you're using role-based protection
};

export default PrivateRoute;
