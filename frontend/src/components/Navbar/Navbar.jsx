// src/components/Navbar/Navbar.jsx
import { useEffect, useState, useCallback } from "react";
// import './Navbar.css';
import logo from "/images/logo.png";
import menu_icon from "/images/menu-icon.png";
import { navLinks } from "../../data/navbarLinks";
import { useScrollToSection } from "../../utils/scrollUtils";

// New, more modular imports
import NavItem from "./NavItem";
import AuthNavigation from "./AuthNavigation";

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

  return (
    <nav className={`navbar ${isSticky ? "dark-nav" : "transparent-nav"}`}>
      <div className="navbar-logo">
        <img src={logo} alt="Zeelevate Company Logo" />
      </div>

      <ul
        className={isMobileMenuOpen ? "show-mobile-menu" : "hide-mobile-menu"}
      >
        {/* Render static navigation links using the new NavItem component */}
        {navLinks.map((link) => (
          <li key={link.label}>
            <NavItem
              label={link.label}
              id={link.id} // Will be undefined for router links, handled by NavItem
              to={link.to} // Will be undefined for scroll links, handled by NavItem
              linkProps={link.linkProps}
              onClickHandler={handleNavItemClick}
            />
          </li>
        ))}

        {/* Render authentication-related UI using the dedicated AuthNavigation component */}
        <AuthNavigation onLinkClick={closeMobileMenu} />
      </ul>

      <img
        src={menu_icon}
        alt="Toggle mobile menu"
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
      />
    </nav>
  );
};

Navbar.propTypes = {
  // No direct props for Navbar in this current setup, but good practice to keep.
};

export default Navbar;
