import React from "react";
import { Link } from "react-router-dom";
import "./TextBox.css";

const TextBox = () => {
  return (
    <div className="text-box">
      <h1 className="hero-title">Unlock Your Digital Future with Zeelevate</h1>
      <p className="hero-subtitle">
        Empowering <span className="highlight">teens (13–18)</span> and{" "}
        <span className="highlight">adults</span> with the skills and confidence
        to thrive in the digital age.
      </p>

      <div className="mission-statement">
        <p>
          <span className="mission-icon">🚀</span> At Zeelevate, our mission is to nurture
          socially-conscious, future-ready individuals through practical and inclusive
          education in digital and financial literacy, coding, and life skills.
        </p>
      </div>

      <div className="course-highlights">
        <h2>Explore Key Learning Areas</h2>
        <div className="program-list">
          <ul>
            <li>
              <span className="list-icon">💻</span>
              <span className="list-text">Python Programming</span>
            </li>
            <li>
              <span className="list-icon">🌐</span>
              <span className="list-text">Digital Literacy</span>
            </li>
            <li>
              <span className="list-icon">💰</span>
              <span className="list-text">Financial Literacy</span>
            </li>
            <li>
              <span className="list-icon">🎓</span>
              <span className="list-text">College Preparation</span>
            </li>
          </ul>
        </div>
        <p className="teachable-note">
          All courses are available through{" "}
          <a
            href="https://www.teachable.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Teachable
          </a>
          , providing flexible and accessible learning opportunities.
        </p>
      </div>

      <div className="cta-buttons">
        <Link to="/courses?audience=teen" className="cta-btn teen-btn">
        Explore Teen Courses
        </Link>
        <Link to="/courses?audience=adult" className="cta-btn adult-btn">
        Discover Adult Programs
        </Link>
        <Link to="/about" className="cta-btn learn-more-btn">
        Learn More About Us
        </Link>
      </div>
    </div>
  );
};

export default TextBox;
