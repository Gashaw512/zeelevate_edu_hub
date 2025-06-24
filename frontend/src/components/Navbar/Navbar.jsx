// src/components/Navbar/Navbar.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useScrollToSection } from "../../hooks/useScrollToSection";

import styles from "./Navbar.module.css";
import logo from "/images/logo.png";
import { navLinks } from "../../data/navbarLinks";
import NavItem from "../common/NavItem";
import AuthNavigation from "./AuthNavigation";
import { FaBars, FaTimes } from "react-icons/fa";

/**
 * Navbar component: Handles main navigation with sticky behavior,
 * mobile menu toggling, smooth scroll or route navigation,
 * and conditional rendering of auth links.
 */
const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Destructure handler from the custom hook (named import)
  const { handleNavigationAndScroll } = useScrollToSection();

  // Toggle mobile menu visibility
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Close mobile menu (pass to child components to close menu on link click)
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  /**
   * Handles clicks on nav items, differentiating between scroll and route links.
   * Closes mobile menu after click.
   */
  const handleNavbarItemClick = useCallback(
    (event, targetIdOrPath, linkType) => {
      handleNavigationAndScroll(event, targetIdOrPath, linkType, closeMobileMenu);
    },
    [handleNavigationAndScroll, closeMobileMenu]
  );

  // Sticky navbar logic: Adds sticky class when scrolled past threshold
  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    onScroll(); // initialize on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Scroll to hash on initial load if present (enhancement for direct hash links)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <nav className={`${styles.navbar} ${isSticky ? styles.darkNav : styles.transparentNav}`}>
      {/* Logo - acts as route navigation to home */}
      <div
        className={styles.navbarLogo}
        role="button"
        tabIndex={0}
        aria-label="Navigate to home"
        onClick={(e) => handleNavbarItemClick(e, "/", "route")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleNavbarItemClick(e, "/", "route");
          }
        }}
      >
        <img src={logo} alt="Zeelevate Company Logo" className={styles.logoImg} />
      </div>

      {/* Navigation Links */}
      <ul
        className={`${styles.navbarNav} ${
          isMobileMenuOpen ? styles.showMobileMenu : styles.hideMobileMenu
        }`}
      >
        {navLinks.map(({ label, id, to, type, linkProps }) => (
          <li key={label} className={styles.navItem}>
            <NavItem
              label={label}
              id={id}
              to={to}
              type={type}
              linkProps={linkProps}
              onClickHandler={handleNavbarItemClick}
            />
          </li>
        ))}

        {/* Authentication Links (Sign In, Sign Up, Logout, etc.) */}
        <AuthNavigation onLinkClick={closeMobileMenu} />
      </ul>

      {/* Mobile menu toggle button */}
      <div
        className={styles.menuIcon}
        role="button"
        tabIndex={0}
        aria-label="Toggle mobile navigation menu"
        onClick={toggleMobileMenu}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleMobileMenu();
          }
        }}
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
