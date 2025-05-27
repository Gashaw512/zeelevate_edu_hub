// src/components/AboutUs/AboutUsBox.jsx
import { Link } from "react-router-dom";
import FounderCard from "./FounderCard"; // Assuming this is correct
import OrgStory from "./OrgStory";     // Assuming this is correct
import IntroVideo from "./IntroVideo"; // Assuming this is correct
import { founders } from "../../data/founders"; // Adjust path as needed
import "./AboutUsBox.css";

const AboutUsBox = () => {
  return (
    <section className="about-us-section"> {/* Renamed for clarity */}
      <div className="about-us-container">
        <h1 className="section-title">Discover Zeelevate Academy</h1> {/* Main title for the section */}

        <div className="about-content">
          {/* Organization Story first - sets the context */}
          <OrgStory />

          {/* Introductory Video - adds a dynamic element */}
          <IntroVideo />

          {/* Call-to-action within the section, prompting for course exploration */}
          <div className="about-section-cta">
            <h2 className="cta-heading-small">Ready to start your learning journey?</h2>
            <Link to="/courses" className="cta-button primary-cta-button"> {/* Reusing CTA button styles */}
              Explore All Courses
            </Link>
          </div>

          {/* Meet the Team - Founders */}
          <h2 className="section-subtitle">Meet Our Visionary Founders</h2> {/* Subtitle for this subsection */}
          <p className="section-description">
            The foundation of Zeelevate Academy lies in the passion and expertise of our founders, dedicated to empowering the next generation.
          </p>
          <div className="founder-profiles">
            {founders.map((founder) => (
              <FounderCard key={founder.name} {...founder} />
            ))}
          </div>

          {/* Optional: Add a "Why Choose Us" or "Our Values" section here */}
          <div className="why-choose-us">
            <h2 className="section-subtitle">Why Choose Zeelevate?</h2>
            <ul className="values-list">
              <li>**Expert-Led Content:** Learn from industry professionals with real-world experience.</li>
              <li>**Practical Skills Focus:** Gain actionable knowledge directly applicable to today's job market.</li>
              <li>**Community & Support:** Join a vibrant learning community with dedicated mentorship.</li>
              <li>**Flexible Learning:** Access courses anytime, anywhere, at your own pace.</li>
              <li>**Future-Ready Curriculum:** Stay ahead with constantly updated content in vital domains.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsBox;