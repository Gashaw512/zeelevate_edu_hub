import "./Navbar.css";
import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase/auth";
import ProfileDropdown from "../auth/profileDropdown/ProfileDropDown";
import { Link, NavLink } from "react-router-dom"; // Changed Link to NavLink
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faBars } from "@fortawesome/free-solid-svg-icons";
import { navbarLinks } from "../../data/navbarLinks"
import logo from "/images/logo.png";
// import logo1 from "/images/logos.png";

const Navbar = () => {
  const navLinkRef = useRef();
  // const [isAuthenticated, setIsAuthenticated] = useState(false); // Simulated auth
  const { user } = useAuth();

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
  return (
    <nav className="navbar">
    <Link to="/" className="logo">
      <img src={logo} alt="Logo" />
    </Link>

    <div className="nav-links" ref={navLinkRef}>
      <FontAwesomeIcon icon={faTimes} className="fas close-icon" onClick={hideMenu} />

      <ul>
        {
          navbarLinks.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                onClick={hideMenu}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}` // Basic active class
                }
              >
                <span className="nav-icon">{link.icon}</span>
                {link.name}
              </NavLink>
            </li>
          ))}
      </ul>

    </div>

    {/* Auth buttons container (to the right) */}
    <div className="auth-buttons-container">
      {!user ? (
        <>
          <Link to="/signin"><button className="auth-button" onClick={hideMenu}>SIGN IN</button></Link>
          <Link to="/signup"><button className="auth-button" onClick={hideMenu}>SIGN UP</button></Link>
        </>
      ) : (
        <div className="ml-4">
          <ProfileDropdown avatarUrl={user.photoURL || '/default-profile.png'} />
        </div>
      )}
    </div>

    <FontAwesomeIcon icon={faBars} className="fas menu-icon" onClick={showMenu} />
  </nav>
  );
};

export default Navbar;
