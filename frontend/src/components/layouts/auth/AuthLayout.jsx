import PropTypes from 'prop-types';
import logo from '/images/logo.png';
import './AuthLayout.css'; // Assuming AuthLayout.css is still used for general auth styles

const AuthLayout = ({ title, instruction, children, isWide = false }) => { // Added isWide prop with default false
  return (
    // Conditionally apply a wider class based on the isWide prop
    <div className={`auth-layout-container ${isWide ? 'auth-layout-container-wide' : ''}`}>
      <div className="logo">
        <img src={logo} alt="Zeelevate Logo" className="logo-image" />
      </div>
      <h2 className="welcome-text">{title}</h2>
      <p className="auth-instruction">{instruction}</p>
      {children}
    </div>
  );
};

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  instruction: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isWide: PropTypes.bool, // PropTypes for the new prop
};

export default AuthLayout;
