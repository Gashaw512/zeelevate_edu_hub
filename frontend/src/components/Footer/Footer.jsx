// src/components/Footer/Footer.jsx
import  { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'; // For the copyright link
import styles from './Footer.module.css';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaHeart, FaChevronUp } from 'react-icons/fa';
import logo from "/images/logo.png";
import { navLinks } from '../../data/navbarLinks'; 
import { useScrollToSection } from "../../hooks/useScrollToSection"; 
import NavItem from '../common/NavItem'; 

/**
 * Footer Component
 * Provides quick links, social media, and scroll-to-top functionality.
 * All navigation links utilize the shared `useScrollToSection` hook.
 */
const Footer = () => {
  const { handleNavigationAndScroll } = useScrollToSection(); // Get the unified handler

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Prepare footer links: include 'Sign Up' and ensure 'type' is correctly set
  const footerLinks = [
    ...navLinks.filter(link => link.label !== 'Sign In'), // Exclude 'Sign In' if it's dynamic
    // Example: Adding a 'Sign Up' route link
    { label: 'Sign Up', to: '/signup', type: 'route' },
  ];

  /**
   * Universal click handler for Footer links.
   * It uses the `handleNavigationAndScroll` from the hook.
   *
   * @param {Event} event - The native DOM click event.
   * @param {string} path - The target path (ID for scroll, URL for route).
   * @param {'scroll' | 'route'} type - The type of link.
   */
  const handleFooterLinkClick = useCallback(
    (event, path, type) => {
      // The footer doesn't have a menu to close, so no `onCloseMenuCallback` is passed.
      handleNavigationAndScroll(event, path, type, null);
    },
    [handleNavigationAndScroll]
  );

  return (
    <footer className={styles.zeelevateFooter}>
      <div className={styles.footerContainer}>
        <div className={styles.footerBrand}>
          <div className={styles.footerLogoTitle}>
            <img src={logo} alt="Zeelevate Logo" className={styles.footerLogo} />
          </div>
          <p className={styles.footerTagline}>Empowering Digital Futures</p>
        </div>

        <div className={styles.footerSections}>
          <div className={styles.footerAbout}>
            <h5 className={styles.footerSectionTitle}>About Us</h5>
            <p className={styles.footerDescription}>
              Zeelevate is on a mission to bridge the digital divide by offering
              inclusive, accessible, and impactful courses that empower individuals
              and communities across Africa.
            </p>
          </div>

          <div className={styles.footerLinksSection}>
            <h5 className={styles.footerSectionTitle}>Quick Links</h5>
            <ul className={styles.footerLinks}>
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <NavItem
                    label={link.label}
                    id={link.id} // For scroll links
                    to={link.to} // For route links
                    type={link.type} // Crucial for NavItem to render correctly
                    linkProps={link.linkProps}
                    onClickHandler={handleFooterLinkClick} // Pass the unified handler
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.footerContact}>
            <h5 className={styles.footerSectionTitle}>Connect With Us</h5>
            <div className={styles.socialIcons}>
              <a href="https://facebook.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://twitter.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://linkedin.com/company/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>
              <a href="https://instagram.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerMeta}>
            <p>© {new Date().getFullYear()} <Link to="/" onClick={scrollToTop}>ZEELEVATE</Link> | All Rights Reserved</p>
            <p className={styles.madeWith}>
              Made with <FaHeart aria-label="love" /> by ZEELEVATE
            </p>
          </div>
          <div className={styles.scrollTop} onClick={scrollToTop} role="button" aria-label="Scroll to top">
            <FaChevronUp />
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {};

export default Footer;