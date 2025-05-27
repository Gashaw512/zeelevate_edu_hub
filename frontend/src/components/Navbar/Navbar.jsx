// src/components/Navbar/Navbar.jsx
import { useEffect, useState, useCallback } from "react";
// import './Navbar.css'; // Make sure this import is correct
import logo from "/images/logo.png";
// IMPORTANT: Use an actual menu icon for a hamburger, not menu-icon.png if it's a fixed image.
// If menu-icon.png is your hamburger, that's fine. Otherwise, consider an SVG or FontAwesome icon.
import menu_icon_img from "/images/menu-icon.png"; // Renamed to avoid conflict
import { navLinks } from "../../data/navbarLinks";
import { useScrollToSection } from "../../utils/scrollUtils";

// New, more modular imports
import NavItem from "./NavItem";
import AuthNavigation from "./AuthNavigation";
import { FaBars, FaTimes } from 'react-icons/fa'; // Import icons for menu toggle


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

  const { handleNavLinkClick } = useScrollToSection();

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

  // Handler for NavItem's onClick. It conditionally calls handleNavLinkClick
  // for scroll links or simply closes the menu for router links.
  const handleNavItemClick = useCallback(
    (id, e) => {
      if (id) {
        handleNavLinkClick(id, e, closeMobileMenu); // Pass e for scroll behavior
      } else {
        closeMobileMenu(); // Just close for router links
      }
    },
    [handleNavLinkClick, closeMobileMenu]
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

  // Effect to prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset'; // Clean up on unmount
    };
  }, [isMobileMenuOpen]);


  return (
    <nav className={`navbar ${isSticky ? "dark-nav" : "transparent-nav"}`}>
      <div className="navbar-logo">
        <img src={logo} alt="Zeelevate Company Logo" />
      </div>

      <ul
        // THIS IS THE CRUCIAL CHANGE: Conditional class for mobile menu display
        className={`navbar-links ${isMobileMenuOpen ? "show-mobile-menu" : "hide-mobile-menu"}`}
      >
        {/* Render static navigation links using the new NavItem component */}
        {navLinks.map((link) => (
          <li key={link.label}>
            <NavItem
              label={link.label}
              id={link.id}
              to={link.to}
              linkProps={link.linkProps}
              onClickHandler={handleNavItemClick}
            />
          </li>
        ))}

        {/* Render authentication-related UI using the dedicated AuthNavigation component */}
        <AuthNavigation onLinkClick={closeMobileMenu} />
      </ul>

      {/* Use FontAwesome icons for a more professional and flexible menu icon */}
      <div
        className="menu-icon"
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
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />} {/* Show X icon when open, Bars when closed */}
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  // No direct props for Navbar in this current setup, but good practice to keep.
};

export default Navbar;