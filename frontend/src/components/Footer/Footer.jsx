import React from 'react';
import PropTypes from 'prop-types'; // Add PropTypes for type checking
import './Footer.css'; // Make sure you have this CSS file
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaHeart, FaChevronUp } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Keep this for the "ZEELEVATE" link in the footer bottom
import logo from "/images/logo.png";
import { navLinks } from '../../data/navbarLinks';

// Import the new NavItem component
import NavItem from '../Navbar/NavItem'; // Adjust path if NavItem is in a different directory

/**
 * Footer Component
 *
 * This component provides a comprehensive footer for the application,
 * including brand information, quick links, social media connections,
 * copyright, and a scroll-to-top feature.
 *
 * @returns {JSX.Element} The Footer component.
 */
const Footer = () => {
  /**
   * Scrolls the window to the top with smooth behavior.
   * @type {function(): void}
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter out the 'Sign In' link as it's handled dynamically elsewhere
  // and likely not relevant for a static footer navigation.
  const footerLinks = navLinks.filter(link => link.label !== 'Sign In');

  // Define a simple click handler for footer NavItems to ensure the scroll-to-top
  // also happens and potentially any other footer-specific actions.
  const handleFooterNavLinkClick = () => {
    scrollToTop(); // Always scroll to top when a footer nav link is clicked
    // Add any other footer-specific logic here if needed
  };

  return (
    <footer className="zeelevate-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo-title">
            <img src={logo} alt="Zeelevate Logo" className="footer-logo" />
          </div>
          <p className="footer-tagline">Empowering Digital Futures</p>
        </div>

        <div className="footer-sections">
          <div className="footer-about">
            <h5 className="footer-section-title">About Us</h5>
            <p className="footer-description">
              Zeelevate is on a mission to bridge the digital divide by offering
              inclusive, accessible, and impactful courses...
            </p>
          </div>

          <div className="footer-links-section">
            <h5 className="footer-section-title">Quick Links</h5>
            <ul className="footer-links">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  {/* Use the reusable NavItem component for footer links */}
                  <NavItem
                    label={link.label}
                    id={link.id} // For scroll-to-section links
                    to={link.to} // For React Router links (if any, though 'Sign In' is filtered)
                    linkProps={link.linkProps} // Pass any specific props (e.g., smooth scroll behavior)
                    onClickHandler={handleFooterNavLinkClick} // Custom handler for footer clicks
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-contact">
            <h5 className="footer-section-title">Connect With Us</h5>
            <div className="social-icons">
              <a href="https://facebook.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://twitter.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://linkedin.com/company/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>
              <a href="https://instagram.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-meta">
            <p>© {new Date().getFullYear()} <Link to="/" onClick={scrollToTop}>ZEELEVATE</Link> | All Rights Reserved</p>
            <p className="made-with">Zeelevate: Elevating Africa’s Digital Future</p>
          </div>
          <div className="scroll-top" onClick={scrollToTop} role="button" aria-label="Scroll to top">
            <FaChevronUp />
          </div>
        </div>
      </div>
    </footer>
  );
};

// Add PropTypes for better component documentation and validation.
Footer.propTypes = {
  // Currently, Footer doesn't receive any direct props,
  // but it's good practice to keep this section for future use.
};

export default Footer;