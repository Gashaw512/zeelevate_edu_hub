import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

const Footer = () => {
  return (
    <footer className="zeelevate-footer">
      <div className="footer-content">
        <h4>Empowering Digital Futures</h4>
        <p>
          Zeelevate Academy is dedicated to equipping learners with essential 21st-century skills 
          through courses in Python programming, financial literacy, digital citizenship, and 
          college preparation. Join our community to transform your digital capabilities and 
          unlock new opportunities in today's tech-driven world.
        </p>
        
        <div className="social-links">
          <a href="https://facebook.com/zeelevate" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a href="https://linkedin.com/company/zeelevate" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faLinkedinIn} />
          </a>
          <a href="https://instagram.com/zeelevate" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a href="https://youtube.com/zeelevate" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faYoutube} />
          </a>
        </div>

        <div className="footer-meta">
          <p className="copyright">
            © 2023 Zeelevate Academy. All rights reserved.
          </p>
          <p className="made-with">
            Crafted with <FontAwesomeIcon icon={faHeart} /> for digital learners
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;