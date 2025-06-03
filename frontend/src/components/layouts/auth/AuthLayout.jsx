// src/layouts/auth/AuthLayout.jsx
import PropTypes from 'prop-types';
import Footer from '../../Footer/Footer'; // Assuming your Footer is reusable
import AuthHeader from '../../Auth/AuthHeader'; // Correct path to AuthHeader
import styles from './AuthLayout.module.css'; // Your CSS Module for AuthLayout

/**
 * AuthLayout Component
 * Provides a consistent and streamlined layout for authentication-related pages.
 * It includes a dedicated header (AuthHeader), a main content area for forms, and a footer.
 *
 * @param {object} props - Component props.
 * @param {string} props.title - The main title for the layout (e.g., "Welcome Back!").
 * @param {string} props.instruction - Sub-instruction text (e.g., "Please sign in to access your account.").
 * @param {React.ReactNode} props.children - The main content to be rendered within the layout (e.g., SignIn form).
 * @param {boolean} [props.isWide=false] - If true, applies a wider style to the content box.
 * @param {string} [props.navLinkTo=''] - Optional: The path for a navigation link in the header.
 * @param {string} [props.navLinkLabel=''] - Optional: The label for the navigation link in the header.
 * @returns {JSX.Element} The authentication page layout.
 */
const AuthLayout = ({
  title,
  instruction,
  children,
  isWide = true, // Default to false (narrow) for typical auth forms
  navLinkTo = '',
  navLinkLabel = '',
}) => {
  return (
    <div className={styles.authLayoutContainer}>
      <AuthHeader
        showNavLink={!!navLinkTo && !!navLinkLabel}
        navLinkTo={navLinkTo}
        navLinkLabel={navLinkLabel}
      />
      {/* Main content area, handles centering and wide/narrow layout */}
      <main className={`${styles.authMainContent} ${isWide ? styles.authMainContentWide : ''}`}>
        {/* This div is the actual form box/card that holds the title, instruction, and children */}
        <div className={styles.authFormBox}>
          <h2 className={styles.welcomeText}>{title}</h2>
          <p className={styles.authInstruction}>{instruction}</p>
          {children} {/* This is where your SignUp/SignIn component's content goes */}
        </div>
      </main>

      <Footer />
    </div>
  );
};

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  instruction: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isWide: PropTypes.bool,
  navLinkTo: PropTypes.string,
  navLinkLabel: PropTypes.string,
};

export default AuthLayout;