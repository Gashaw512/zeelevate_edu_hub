// import "./Footer.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faFacebookF,
//   faInstagram,
//   faLinkedinIn,
//   faYoutube,
// } from "@fortawesome/free-brands-svg-icons";
// import { faHeart } from "@fortawesome/free-solid-svg-icons";

// const Footer = () => {
//   return (
//     <footer className="zeelevate-footer">
//       <div className="footer-content">
//         <h4 className="footer-title">Empowering Digital Futures</h4>
//         <p className="footer-description">
//           Zeelevate is on a mission to bridge the digital divide by offering inclusive, accessible, and impactful courses in Python programming, digital literacy, financial literacy, and college preparation. Whether you're a teen or adult, our platform supports your journey to becoming digitally confident.
//         </p>

//         <div className="social-links">
//           <a href="https://facebook.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
//             <FontAwesomeIcon icon={faFacebookF} />
//           </a>
//           <a href="https://linkedin.com/company/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
//             <FontAwesomeIcon icon={faLinkedinIn} />
//           </a>
//           <a href="https://instagram.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
//             <FontAwesomeIcon icon={faInstagram} />
//           </a>
//           <a href="https://youtube.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
//             <FontAwesomeIcon icon={faYoutube} />
//           </a>
//         </div>

//         <div className="footer-meta">
//           <p className="copyright">
//             © {new Date().getFullYear()} ZEELEVATE | All Rights Reserved.
//           </p>
//           <p className="made-with">
//             Crafted with <FontAwesomeIcon icon={faHeart} /> for tomorrow’s digital leaders.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React from 'react';
import './Footer.css'; // Make sure you have this CSS file
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaHeart, FaChevronUp } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // If you're using React Router for navigation
import logo from "/images/logo.png";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="zeelevate-footer">
      <div className="footer-container">
        <div className="footer-brand">
          {/* <h4 className="footer-title">ZEELEVATE</h4> */}
          <div className="footer-logo-title">
            <img src={logo} alt="Zeelevate Logo" className="footer-logo" />
            {/* <h4 className="footer-title">ZEELEVATE</h4> */}
          </div>
          <p className="footer-tagline">Empowering Digital Futures</p>
        </div>

        <div className="footer-sections">
          <div className="footer-about">
            <h5 className="footer-section-title">About Us</h5>
            <p className="footer-description">
              Zeelevate is on a mission to bridge the digital divide by offering
              inclusive, accessible, and impactful courses...
            </p>
          </div>

          <div className="footer-links-section">
            <h5 className="footer-section-title">Quick Links</h5>
            <nav className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/services">Services</Link>
              <Link to="/courses">Courses</Link>
              <Link to="/team">Team</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>

          <div className="footer-contact">
            <h5 className="footer-section-title">Connect With Us</h5>
            <div className="social-icons">
              <a href="https://facebook.com/zeelevate" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
              <a href="https://twitter.com/zeelevate" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="https://linkedin.com/company/zeelevate" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
              <a href="https://instagram.com/zeelevate" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-meta">
          <p>© {new Date().getFullYear()} <Link to="/">ZEELEVATE</Link> | All Rights Reserved</p>
            <p className="made-with">Zeelevate: Elevating Africa’s Digital Future</p>

          </div>
          <div className="scroll-top" onClick={scrollToTop}>
            <FaChevronUp />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;