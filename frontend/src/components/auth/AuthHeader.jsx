// src/components/Auth/AuthHeader.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import logo from '/images/blueLogo.png'; // Make sure this path is correct
import styles from './AuthHeader.module.css'; // Your CSS Module for AuthHeader

/**
 * AuthHeader Component
 * Renders a simplified header for authentication and other focused pages.
 * Includes the company logo (linking to homepage) and an an optional navigation link.
 */
const AuthHeader = ({ showNavLink = false, navLinkTo = '', navLinkLabel = '' }) => {
  return (
    <header className={styles.authHeader}>
      <div className={styles.authHeaderContent}>
        <Link to="/" className={styles.authLogoLink} aria-label="Go to homepage">
          <img src={logo} alt="Zeelevate Logo" className={styles.authLogo} />
        </Link>
        {showNavLink && navLinkTo && navLinkLabel && (
          <nav className={styles.authNav}>
            <Link to={navLinkTo} className={styles.authNavLink}>
              {navLinkLabel}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

AuthHeader.propTypes = {
  /**
   * If true, an optional navigation link will be displayed.
   */
  showNavLink: PropTypes.bool,
  /**
   * The destination path for the navigation link (e.g., "/signin" or "/signup").
   * Required if showNavLink is true.
   */
  navLinkTo: PropTypes.string,
  /**
   * The text label for the navigation link (e.g., "Sign In" or "Create an Account").
   * Required if showNavLink is true.
   */
  navLinkLabel: PropTypes.string,
};

export default AuthHeader;