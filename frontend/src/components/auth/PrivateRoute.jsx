// src/components/auth/PrivateRoute.jsx
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => { // Changed 'role' to 'allowedRoles'
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading indicator while Firebase auth state is being determined
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <div className="text-xl text-gray-700">Authenticating...</div>
      </div>
    );
  }

  // Case 1: User is NOT logged in
  if (!user) {
    // Redirect to signin page. `replace` ensures the user can't just hit back to access.
    return <Navigate to="/signin" replace />;
  }

  // Case 2: User IS logged in, now check roles if `allowedRoles` are specified
  if (allowedRoles && allowedRoles.length > 0) {
    // Ensure user.role exists and is a string for comparison
    const userRole = user.role;
    if (typeof userRole !== 'string' || !allowedRoles.includes(userRole)) {
      // User logged in but their role is not among the allowed roles.
      // Redirect to a specific unauthorized page to inform the user.
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Case 3: User is logged in and (if roles were checked) has an allowed role.
  // Render the children (the protected component/layout).
  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  // allowedRoles is an array of strings, signifying acceptable roles for this route.
  // It's optional if the route only requires being logged in, not a specific role.
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default PrivateRoute;