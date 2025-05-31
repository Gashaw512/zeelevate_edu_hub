import React from 'react';
import PropTypes from 'prop-types';
import styles from './Footer.module.css'; // Changed to CSS Modules
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaHeart, FaChevronUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
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

  // Include 'Sign Up' in the footer links, but keep 'Sign In' filtered out if it's handled differently
  const footerLinks = [
    ...navLinks.filter(link => link.label !== 'Sign In'),
    { label: 'Sign Up', id: 'signup', to: '/signup', type: 'route' } // Assuming 'Sign Up' has a route
  ];

  // Define a simple click handler for footer NavItems to ensure the scroll-to-top
  const handleFooterNavLinkClick = () => {
    scrollToTop(); // Always scroll to top when a footer nav link is clicked
    // Add any other footer-specific logic here if needed
  };

  return (
    <footer className={styles.zeelevateFooter}> {/* Use styles.className */}
      <div className={styles.footerContainer}> {/* Use styles.className */}
        <div className={styles.footerBrand}> {/* Use styles.className */}
          <div className={styles.footerLogoTitle}> {/* Use styles.className */}
            <img src={logo} alt="Zeelevate Logo" className={styles.footerLogo} /> {/* Use styles.className */}
          </div>
          <p className={styles.footerTagline}>Empowering Digital Futures</p> {/* Use styles.className */}
        </div>

        <div className={styles.footerSections}> {/* Use styles.className */}
          <div className={styles.footerAbout}> {/* Use styles.className */}
            <h5 className={styles.footerSectionTitle}>About Us</h5> {/* Use styles.className */}
            <p className={styles.footerDescription}> {/* Use styles.className */}
              Zeelevate is on a mission to bridge the digital divide by offering
              inclusive, accessible, and impactful courses that empower individuals
              and communities across Africa.
            </p>
          </div>

          <div className={styles.footerLinksSection}> {/* Use styles.className */}
            <h5 className={styles.footerSectionTitle}>Quick Links</h5> {/* Use styles.className */}
            <ul className={styles.footerLinks}> {/* Use styles.className */}
              {footerLinks.map((link) => (
                <li key={link.label}>
                  {/* NavItem will handle its own internal classes */}
                  <NavItem
                    label={link.label}
                    id={link.id}
                    to={link.to}
                    linkProps={link.linkProps}
                    onClickHandler={handleFooterNavLinkClick}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.footerContact}> {/* Use styles.className */}
            <h5 className={styles.footerSectionTitle}>Connect With Us</h5> {/* Use styles.className */}
            <div className={styles.socialIcons}> {/* Use styles.className */}
              <a href="https://facebook.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://twitter.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://linkedin.com/company/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>
              <a href="https://instagram.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}> {/* Use styles.className */}
          <div className={styles.footerMeta}> {/* Use styles.className */}
            <p>© {new Date().getFullYear()} <Link to="/" onClick={scrollToTop}>ZEELEVATE</Link> | All Rights Reserved</p>
            <p className={styles.madeWith}> {/* Use styles.className */}
              Made with <FaHeart aria-label="love" /> by ZEELEVATE
            </p>
          </div>
          <div className={styles.scrollTop} onClick={scrollToTop} role="button" aria-label="Scroll to top"> {/* Use styles.className */}
            <FaChevronUp />
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  // No direct props needed here
};

export default Footer;