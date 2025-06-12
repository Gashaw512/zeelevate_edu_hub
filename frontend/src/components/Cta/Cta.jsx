// src/components/Cta/Cta.jsx
import { Link } from "react-router-dom";
import "./Cta.css";
// Optional: Import FontAwesome icons if you want to add subtle icons to buttons
// import { FaArrowRight, FaGraduationCap } from 'react-icons/fa';

/**
 * Cta Component
 *
 * This component serves as a prominent Call to Action section,
 * encouraging users to explore courses and learn more about Zeelevate Academy.
 * It features engaging copy and clear action buttons.
 *
 * @returns {JSX.Element} The Cta component.
 */
const Cta = () => {
  return (
    <section className="cta-section"> 
      <div className="cta-content"> 
        <h2 className="cta-heading">
          Ready to Elevate Your Skills?
        </h2>
        <p className="cta-description">
          Join Zeelevate Academy and master cutting-edge skills in digital literacy, financial insights, and programming to shape your professional future.
        </p>
        <div className="cta-buttons">
          <a
            href="https://www.teachable.com/" // Replace with your actual course platform link
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button primary-cta-button" // New, more descriptive classes
          >
            {/* Optional: Add an icon */}
            {/* <FaGraduationCap className="button-icon" /> */}
            Explore Courses
          </a>
          <Link
            to="/about"
            className="cta-button secondary-cta-button" // New, more descriptive classes
          >
            {/* Optional: Add an icon */}
            {/* <FaArrowRight className="button-icon" /> */}
            Learn About Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Cta;