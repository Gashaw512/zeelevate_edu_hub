import React from 'react';
import PropTypes from 'prop-types';
import styles from './SocialAuthButtons.module.css'; // Import the CSS Module

const SocialAuthButtons = ({ providers, onSignIn }) => {
  return (
    <div className={styles.externalSignin}> {/* Use CSS Module class */}
      <div className={styles.socialAuthContainer}> {/* Use CSS Module class */}
        {providers.map((provider) => (
          <button
            key={provider.name}
            onClick={() => onSignIn(provider.name)}
            // Dynamically apply provider-specific styles using template literals
            className={`${styles.socialAuthButton} ${styles[provider.name.toLowerCase() + 'Button'] || ''}`}
          >
            {provider.icon &&
              provider.icon.component &&
              React.createElement(provider.icon.component, { className: styles.socialIcon })} {/* Apply icon style */}
            <span className={styles.socialButtonLabel}>{provider.label}</span> {/* Use CSS Module class */}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialAuthButtons;

SocialAuthButtons.propTypes = {
  providers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.shape({
        component: PropTypes.elementType,
        // className is no longer directly used from provider.icon,
        // as we apply our own styles. You might remove it if not needed elsewhere.
        className: PropTypes.string,
      }),
    })
  ).isRequired,
  onSignIn: PropTypes.func.isRequired,
};
