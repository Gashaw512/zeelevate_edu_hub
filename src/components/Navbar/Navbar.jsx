import "./Navbar.css";
import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom"; // Import Link
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faBars } from "@fortawesome/free-solid-svg-icons";
import { navbarLinks } from "../../data/navbarLinks";
import ProfileDropdown from "./ProfileDropdown";
import { useScrollToSection } from "../../utils/scrollUtils"; // Import the custom hook
import logo from "/images/logo.png";

const Navbar = () => {
  const navLinkRef = useRef();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { handleNavLinkClick } = useScrollToSection(); 

  const showMenu = () => {
    if (navLinkRef.current) {
      navLinkRef.current.style.left = "0";
    }
    setIsMenuOpen(true);
  };

  const hideMenu = () => {
    if (navLinkRef.current) {
      navLinkRef.current.style.left = "-200px";
    }
    setIsMenuOpen(false);
  }


  const handleHomeClick = (event) => {
    event.preventDefault();
    handleNavLinkClick("home", event, hideMenu);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo-img" onClick={handleHomeClick}>
        <img src={logo} alt="Zeelevate Logo" />
      </Link>

      <div className="nav-links" ref={navLinkRef}>
        <div
          className="nav-header-content"
          style={{ display: isMenuOpen ? "flex" : "none" }}
        >
          <Link to="/" className="logo-img" onClick={handleHomeClick}>
            <img src={logo} alt="Zeelevate Logo" />
          </Link>
          <FontAwesomeIcon
            icon={faTimes}
            className="fas close-icon"
            onClick={hideMenu}
          />
        </div>
        <ul>
          {navbarLinks.map((link) => (
            <li key={link.name}>
              <Link
                to="/"
                onClick={(e) => handleNavLinkClick(link.path, e, hideMenu)}
                className="nav-link"
              >
                <span className="nav-icon">{link.icon}</span>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Auth buttons */}
      <div className="auth-buttons-container">
        {!user ? (
          <>
            <Link to="/signin">
              <button className="auth-button" onClick={hideMenu}>
                SIGN IN
              </button>
            </Link>
            <Link to="/signup">
              <button className="auth-button" onClick={hideMenu}>
                SIGN UP
              </button>
            </Link>
          </>
        ) : (
          <div className="flex items-center ml-4">
            <ProfileDropdown
              avatarUrl={user.photoURL || "/default-profile.png"}
            />
          </div>
        )}
      </div>

      <FontAwesomeIcon
        icon={faBars}
        className="fas menu-icon"
        onClick={showMenu}
      />
    </nav>
  );
};

export default Navbar;
