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

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { handleNavigationAndScroll } = useScrollToSection();

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleNavbarItemClick = useCallback(
    (event, targetIdOrPath, linkType) => {
      handleNavigationAndScroll(event, targetIdOrPath, linkType, closeMobileMenu);
    },
    [handleNavigationAndScroll, closeMobileMenu]
  );

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

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

      {/* Navigation Links with Close Button inside for Mobile */}
      <ul
        className={`${styles.navbarNav} ${
          isMobileMenuOpen ? styles.showMobileMenu : styles.hideMobileMenu
        }`}
      >
        {/* Mobile Menu Header with Close Icon */}
        <div className={styles.mobileMenuHeader}>
          <div
            className={styles.menuIcon}
            role="button"
            tabIndex={0}
            aria-label="Close mobile navigation menu"
            onClick={toggleMobileMenu}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleMobileMenu();
              }
            }}
          >
            <FaTimes />
          </div>
        </div>

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

        {/* Authentication Links */}
        <AuthNavigation onLinkClick={closeMobileMenu} />
      </ul>

      {/* Mobile menu toggle button (Hamburger) - hidden on mobile since inside menu now */}
      {!isMobileMenuOpen && (
        <div
          className={styles.menuIcon}
          role="button"
          tabIndex={0}
          aria-label="Open mobile navigation menu"
          onClick={toggleMobileMenu}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleMobileMenu();
            }
          }}
        >
          <FaBars />
        </div>
      )}
    </nav>
  );
};

export default React.memo(Navbar);
