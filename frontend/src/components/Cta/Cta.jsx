import { Link } from "react-router-dom";
import "./Cta.css";

const Cta = () => {
  return (
    <section className="cta">
      <h1>
        Empower Your Future With Our Online Courses
      </h1>
      <p>
        Unlock your potential in digital literacy, financial literacy, and programming.
      </p>
      <div className="cta-buttons">
        <a href="https://www.teachable.com/" target="_blank" rel="noopener noreferrer" className="hero-btn enroll-btn">
          Enroll Now
        </a>
        <Link to="/about" className="hero-btn learn-more-btn">
          Learn More
        </Link>
      </div>
    </section>
  );
};

export default Cta;