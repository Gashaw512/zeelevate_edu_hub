// src/components/Navbar/Navbar.jsx
import { useEffect, useState, useCallback } from "react";
import styles from './Navbar.module.css';
import logo from "/images/logo.png";
import { navLinks } from "../../data/navbarLinks";
import { useScrollToSection } from "../../utils/scrollUtils"; // Ensure this is correctly implemented
import { useLocation } from "react-router-dom"; // Import useLocation for conditional checks

// New, more modular imports
import NavItem from "../common/NavItem";
import AuthNavigation from "./AuthNavigation";
import { FaBars, FaTimes } from "react-icons/fa";

/**
 * Navbar Component
 *
 * This component orchestrates the primary navigation experience,
 * including sticky behavior, mobile menu toggling, and conditional
 * rendering of navigation links and authentication-related UI.
 *
 * @returns {JSX.Element} The Navbar component.
 */
const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation(); // Get current route information

  // The useScrollToSection hook should provide a handler that knows how to
  // scroll OR navigate to the homepage and then scroll.
  const { handleNavLinkClick: scrollToSectionOrNavigate } = useScrollToSection();

  /**
   * Toggles the visibility of the mobile navigation menu.
   * @type {function(): void}
   */
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  /**
   * Closes the mobile navigation menu.
   * This function is passed down to NavItem and AuthNavigation components
   * to ensure the menu closes when a link or action is performed.
   * @type {function(): void}
   */
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  /**
   * Handles clicks on any NavItem within the Navbar.
   * This function now correctly receives all parameters from NavItem.
   *
   * @param {Event} event - The native DOM click event.
   * @param {string} id - The HTML ID of the section to scroll to (for 'scroll' links).
   * @param {string} to - The URL path (for 'route' links).
   * @param {string} type - 'route' or 'scroll'.
   */
  const handleNavbarItemClick = useCallback(
    (event, id, to, type) => {
      // Prevent default behavior only for scroll links, as RouterLink handles its own.
      // react-scroll's ScrollLink typically handles preventDefault internally for smooth scroll.
      if (type === 'scroll') {
          event.preventDefault(); // Keep this for consistency or if react-scroll ever acts up.
      }

      // If it's a route link, directly navigate and close menu
      if (type === 'route') {
        scrollToSectionOrNavigate(event, id, to, type); // Use the scroll utility to handle navigation
        closeMobileMenu();
      } else if (type === 'scroll') {
        // For scroll links:
        // If we are NOT on the homepage, navigate to the homepage with the hash.
        // The `useScrollToSection` hook will then pick up this hash and scroll.
        if (location.pathname !== '/') {
            scrollToSectionOrNavigate(event, id, to, type); // This will navigate to '/#id'
        } else {
            // If already on the homepage, directly scroll using the utility
            scrollToSectionOrNavigate(event, id, to, type);
        }
        closeMobileMenu(); // Always close menu after click
      }
    },
    [scrollToSectionOrNavigate, closeMobileMenu, location.pathname]
  );

  // Effect hook to manage the sticky navbar behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initialize state on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ensure body scroll lock for mobile menu (existing, keep as is)
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle initial scroll on page load if a hash exists (existing, keep as is)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => { // Small delay to ensure component renders
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location.hash]); // Listen to location.hash changes for robustness

  return (
    <nav className={`${styles.navbar} ${isSticky ? styles.darkNav : styles.transparentNav}`}>
      <div
        className={styles.navbarLogo}
        // When clicking the logo, navigate to home and scroll to top
        onClick={(e) => handleNavbarItemClick(e, "home", "/", "route")} // Treat logo as a route to home
        role="button"
        tabIndex="0"
        aria-label="Scroll to home section"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNavbarItemClick(e, "home", "/", "route");
          }
        }}
      >
        <img src={logo} alt="Zeelevate Company Logo" className={styles.logoImg} />
      </div>

      <ul
        className={`${styles.navbarNav} ${
          isMobileMenuOpen ? styles.showMobileMenu : styles.hideMobileMenu
        }`}
      >
        {/* Render static navigation links using the new NavItem component */}
        {navLinks.map((link) => (
          <li key={link.label} className={styles.navItem}>
            <NavItem
              label={link.label}
              id={link.id}
              to={link.to}
              type={link.type} 
              linkProps={link.linkProps}
              onClickHandler={handleNavbarItemClick} /* Pass the updated handler */
            />
          </li>
        ))}

        {/* Render authentication-related UI */}
        <AuthNavigation onLinkClick={closeMobileMenu} />
      </ul>

      <div
        className={styles.menuIcon}
        onClick={toggleMobileMenu}
        role="button"
        aria-label="Toggle mobile navigation menu"
        tabIndex="0"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleMobileMenu();
          }
        }}
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}{" "}
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  // No direct props for Navbar in this current setup.
};

export default Navbar;