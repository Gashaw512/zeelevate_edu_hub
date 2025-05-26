import React from 'react';
import PropTypes from 'prop-types';

const SocialAuthButtons = ({ providers, onSignIn }) => {
  return (
    <div className="external-signin">
      <div className="social-auth-container">
        {providers.map((provider) => (
          <button
            key={provider.name}
            onClick={() => onSignIn(provider.name)}
            className={`social-auth-button ${provider.name.toLowerCase()}-button`}
          >
            {provider.icon &&
              provider.icon.component &&
              React.createElement(provider.icon.component, { className: provider.icon.className })}
            <span className="social-button-label">{provider.label}</span>
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
        className: PropTypes.string,
      }),
    })
  ).isRequired,
  onSignIn: PropTypes.func.isRequired,
};