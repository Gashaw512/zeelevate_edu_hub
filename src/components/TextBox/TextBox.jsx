import { Link } from "react-router-dom";
import "./TextBox.css";

const TextBox = () => {
  return (
    <div className="text-box">
       {/* Hero/Intro Section */}
      <section className="top-call-to-action">
        <h2 className="top-cta-title">WELCOME TO ZEELEVATE</h2>
        <p className="top-cta-message">
          Join ZEELEVATE on our journey to redefine education for a brighter
          future. Together, let's bridge the gap, celebrate diversity, and
          empower every student to reach their full potential.
        </p>
        <Link to="/register" className="top-cta-button">
          Join Us Now!
        </Link>
      </section>

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">
          Unlock Your Digital Future with Zeelevate
        </h1>
        <p className="hero-subtitle">
          Empowering <span className="highlight">teens (13–18)</span> and{" "}
          <span className="highlight">adults</span> with the skills and
          confidence to thrive in the digital age.
        </p>
      </section>

      {/* Mission Statement */}
      <section className="mission">
        <p className="mission-statement">
          <span className="mission-icon">🚀</span> Our mission at Zeelevate is
          to cultivate socially-conscious, future-ready individuals through
          practical and inclusive education in digital and financial literacy,
          coding, and essential life skills.
        </p>
      </section>

      {/* Course Highlights */}
      <section className="courses">
        <h2>Explore Key Learning Areas</h2>
        <ul className="program-list">
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
        <p className="teachable-note">
          All courses are conveniently accessible through{" "}
          <a
            href="https://www.teachable.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Teachable
          </a>
          , offering flexible and accessible learning opportunities.
        </p>
      </section>

      {/* Call to Action Buttons */}
      <section className="call-to-actions">
        <Link to="/courses?audience=teen" className="cta-btn teen-btn">
          Explore Teen Courses
        </Link>
        <Link to="/courses?audience=adult" className="cta-btn adult-btn">
          Discover Adult Programs
        </Link>
        <Link to="/about" className="cta-btn learn-more-btn">
          Learn More About Us
        </Link>
      </section>
    </div>
  );
};

export default TextBox;
