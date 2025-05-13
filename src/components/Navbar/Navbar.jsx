import "./Navbar.css";
import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase/auth";
import ProfileDropdown from "../auth/profileDropdown/ProfileDropDown";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faBars, faBell } from "@fortawesome/free-solid-svg-icons"; // Import faBell
import { navbarLinks } from "../../data/navbarLinks";
import logo from "/images/zel.jpg";
// import NotificationCenter from "../dashboard/NotificationCenter";

const Navbar = () => {
  const navLinkRef = useRef();
  const { user } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const showMenu = () => {
    if (navLinkRef.current) {
      navLinkRef.current.style.right = "0";
    }
  };

  const hideMenu = () => {
    if (navLinkRef.current) {
      navLinkRef.current.style.right = "-200px";
    }
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleHomeClick = () => {
    event.preventDefault();
    hideMenu(); // Optionally hide the mobile menu after navigation
  };

  return (
    <nav className="navbar">
      <Link to="/" className="img">
        <img src={""} alt="Zeelevate Logo" />
      </Link>

      <div className="nav-links" ref={navLinkRef}>
        <FontAwesomeIcon icon={faTimes} className="fas close-icon" onClick={hideMenu} />

        <ul>
        <NavLink
              to={user ? '/student-page' : '/'} // Initial conditional link (can be refined with onClick)
              onClick={handleHomeClick}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{/* Home Icon */}</span>
              Home
            </NavLink>
          {navbarLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                onClick={hideMenu}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{link.icon}</span>
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Auth buttons and Notification container (to the right) */}
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
            {/* <button onClick={toggleNotification} className="relative mr-4">
              <FontAwesomeIcon icon={faBell} size="lg" /> */}
              {/* Optional: Add a notification badge */}
              {/* <span className="absolute top-0 right-[-8px] bg-red-500 text-white rounded-full text-xs px-1">3</span> */}
            {/* </button>
            {isNotificationOpen && <NotificationCenter onClose={toggleNotification} />} */}
            <ProfileDropdown avatarUrl={user.photoURL || "/default-profile.png"} />
          </div>
        )}
      </div>

      <FontAwesomeIcon icon={faBars} className="fas menu-icon" onClick={showMenu} />
    </nav>
  );
};

export default Navbar;