import "./Navbar.css";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {auth} from "../../firebase/auth";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faBars } from "@fortawesome/free-solid-svg-icons";

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

  // const handleLogin = () => {
  //   // setIsAuthenticated(true);
  //   hideMenu();
  // };

  // const handleLogout = () => {
  //   // setIsAuthenticated(false);
  //   hideMenu();
  // };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img src={logo} alt="Logo" />
      </Link>

      <div className="nav-links" ref={navLinkRef}>
        <FontAwesomeIcon icon={faTimes} className="fas close-icon" onClick={hideMenu} />

        <ul>
          {/* {isAuthenticated && (
            <li>
              <Link to="/dashboard" onClick={hideMenu}>DASHBOARD</Link>
            </li>
          )} */}
          {user && (
            <li>
              <Link to="/student/dashboard" onClick={hideMenu}>DASHBOARD</Link>
            </li>
          )}

          <li><Link to="/" onClick={hideMenu}>HOME</Link></li>
          <li><Link to="/about" onClick={hideMenu}>ABOUT</Link></li>
          <li><Link to="/course" onClick={hideMenu}>COURSES</Link></li>
          <li><Link to="/blog" onClick={hideMenu}>BLOG</Link></li>
          <li><Link to="/contact" onClick={hideMenu}>CONTACT</Link></li>
        </ul>

      </div>

      {/* Auth buttons container (to the right) */}
      <div className="auth-buttons-container">
        {/* {!isAuthenticated ? (
          <>
            <button className="auth-button" onClick={handleLogin}>SIGN IN</button>
            <button className="auth-button" onClick={handleLogin}>SIGN UP</button>
          </>
        ) : (
          <button className="auth-button" onClick={handleLogout}>LOGOUT</button>
        )} */}

        {!user ? (
          <>
            <Link to="/signin"><button className="auth-button" onClick={hideMenu}>SIGN IN</button></Link>
            <Link to="/signup"><button className="auth-button" onClick={hideMenu}>SIGN UP</button></Link>
          </>
        ) : (
          <button className="auth-button" onClick={() => { auth.signOut(); hideMenu(); }}>LOGOUT</button>
        )}

      </div>

      <FontAwesomeIcon icon={faBars} className="fas menu-icon" onClick={showMenu} />
    </nav>
  );
};

export default Navbar;
