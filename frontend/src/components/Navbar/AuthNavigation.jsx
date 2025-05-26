// src/components/Navbar/AuthNavigation.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import { Link } from 'react-router-dom'; // Import Link for consistency if you're using it elsewhere

const AuthNavigation = React.memo(({ onLinkClick }) => {
  const { user } = useAuth();
  const displayAvatarUrl = user?.avatarUrl;

  return (
    <>
      {user ? (
        // For the ProfileDropdown, you might want to wrap it in a div or span
        // if its parent li needs specific styling, but typically the dropdown handles its own styling.
        <li>
          <ProfileDropdown avatarUrl={displayAvatarUrl} onLinkClick={onLinkClick} />
        </li>
      ) : (
        <li>
          {/* Using RouterLink for consistency. Apply a specific class for styling */}
          <Link to="/signin" className="auth-link" onClick={onLinkClick}>
            Sign In
          </Link>
        </li>
      )}
    </>
  );
});

AuthNavigation.propTypes = {
  onLinkClick: PropTypes.func.isRequired,
};

AuthNavigation.displayName = 'AuthNavigation';

export default AuthNavigation;