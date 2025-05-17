
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/signin" />;
  if (role && user.role !== role) return <Navigate to="/unauthorized" />;

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.string, // Optional: only needed if you're using role-based protection
};

export default PrivateRoute;
