import PropTypes from 'prop-types';
import logo from '/images/zel.jpg';
import './AuthLayout.css';

const AuthLayout = ({ title, instruction, children }) => {
  return (
    <div className="auth-layout-container">
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
};

export default AuthLayout;