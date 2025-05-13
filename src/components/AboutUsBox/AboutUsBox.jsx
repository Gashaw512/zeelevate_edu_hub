import React from "react"; // Explicitly import React
import { Link } from "react-router-dom";
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";
import "./AboutUsBox.css";

// Named exports for clarity
export const BezImage = "/images/Bez.JPG";
export const KalebImage = "/images/Kaleb.JPG";
export const SamImage = "/images/Sam.JPG";

const AboutUsBox = () => {
  const founders = [
    {
      name: "Bez Doe",
      role: "CEO & Lead Instructor",
      bio: "10+ years experience in software development and education",
      image: BezImage,
      linkedin: "#",
      twitter: "#",
      github: "#",
    },
    {
      name: "Kaleb Doe",
      role: "CTO & Lead Instructor", // Changed role for variety
      bio: "Expert in financial modeling and data analysis with 8+ years in education", // Changed bio
      image: KalebImage,
      linkedin: "#",
      twitter: "#",
      github: "#",
    },
    {
      name: "Sami Doe",
      role: "Head of Curriculum Development", // Changed role
      bio: "Passionate about digital literacy with 12+ years creating engaging educational content", // Changed bio
      image: SamImage,
      linkedin: "#",
      twitter: "#",
      github: "#",
    },
  ];

  return (
    <section className="about-us">
      <div className="about-us-container"> {/* More descriptive class */}
        <div className="about-content">
          <h1 className="about-us-title">Empowering Digital Learners Worldwide</h1> {/* More specific class */}
          <div className="founder-profiles">
            {founders.map((founder) => (
              <FounderCard key={founder.name} {...founder} />
            ))}
          </div>

          <div className="org-story">
            <h2 className="org-story-title">Our Story</h2> {/* More specific class */}
            <p className="org-story-text"> {/* More specific class */}
              Founded in 2023, Zeelevate Academy emerged from a shared vision to bridge the
              digital skills gap. We specialize in:
            </p>
            <ul className="specializations">
              <li>Python & Web Development</li>
              <li>Financial Literacy Programs</li>
              <li>College Preparation Workshops</li>
              <li>Digital Citizenship Training</li>
            </ul>
          </div>

          <div className="video-section">
            <iframe
              src="https://www.youtube.com/embed/your-video-id"
              title="Zeelevate Introduction"
              allowFullScreen
              className="intro-video" // More specific class
            />
          </div>
        </div>

        <Link to="/course" className="about-us-cta-btn"> {/* More specific class */}
          View Our Courses
        </Link>
      </div>
    </section>
  );
};

// Extracted FounderCard component for better organization
const FounderCard = ({ name, role, bio, image, linkedin, twitter, github }) => (
  <article className="founder-card">
    <img src={image} alt={`Founder ${name}`} className="founder-image" />
    <h3 className="founder-name">{name}</h3> {/* More specific class */}
    <p className="founder-role">{role}</p> {/* More specific class */}
    <p className="founder-bio">{bio}</p> {/* More specific class */}
    <div className="social-links">
      <a href={linkedin} aria-label="LinkedIn"><FaLinkedin /></a>
      <a href={twitter} aria-label="Twitter"><FaTwitter /></a>
      <a href={github} aria-label="GitHub"><FaGithub /></a>
    </div>
  </article>
);

export default AboutUsBox;