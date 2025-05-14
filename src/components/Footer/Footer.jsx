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
        <h4 className="footer-title">Empowering Digital Futures</h4>
        <p className="footer-description">
          Zeelevate is on a mission to bridge the digital divide by offering inclusive, accessible, and impactful courses in Python programming, digital literacy, financial literacy, and college preparation. Whether you're a teen or adult, our platform supports your journey to becoming digitally confident.
        </p>

        <div className="social-links">
          <a href="https://facebook.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a href="https://linkedin.com/company/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FontAwesomeIcon icon={faLinkedinIn} />
          </a>
          <a href="https://instagram.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a href="https://youtube.com/zeelevate" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <FontAwesomeIcon icon={faYoutube} />
          </a>
        </div>

        <div className="footer-meta">
          <p className="copyright">
            © {new Date().getFullYear()} Zeelevate Academy. All rights reserved.
          </p>
          <p className="made-with">
            Crafted with <FontAwesomeIcon icon={faHeart} /> for tomorrow’s digital leaders.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
