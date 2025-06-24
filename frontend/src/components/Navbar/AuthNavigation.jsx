// src/components/Navbar/AuthNavigation.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import ProfileDropdown from './ProfileDropdown'; // This component should NOT return <li>
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css'; // Import Navbar.module.css for styling

const AuthNavigation = React.memo(({ onLinkClick }) => {
  const { user } = useAuth();
  const displayAvatarUrl = user?.avatarUrl;

  return (
    <>
      {/* If user is logged in, directly return the ProfileDropdown.
          The <li> wrapper is handled by Navbar.jsx. */}
      {user ? (
        <ProfileDropdown avatarUrl={displayAvatarUrl} onLinkClick={onLinkClick} />
      ) : (
        /* If user is not logged in, directly return the Link.
           The <li> wrapper is handled by Navbar.jsx. */
        <Link to="/signin" className={styles.authLink} onClick={onLinkClick}>
          Sign In
        </Link>
      )}
    </>
  );
});

AuthNavigation.propTypes = {
  onLinkClick: PropTypes.func.isRequired,
};

AuthNavigation.displayName = 'AuthNavigation';

export default AuthNavigation;