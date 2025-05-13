import { Link } from "react-router-dom";
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";
import "./AboutUsBox.css";
const Founder1 = "/images/Bez.JPG";
const Founder2 = "/images/Kaleb.JPG";
const Founder3 = "/images/Sam.JPG";

const AboutUsBox = () => {
  return (
    <section className="about-us">
      <div className="content-wrapper">
        <div className="about-content">
          <h1>Empowering Digital Learners Worldwide</h1>
          <div className="founder-profiles">
            {/* Founder 1 */}
            <article className="founder-card">
              <img
                src={Founder1}
                alt="Founder John Doe"
                className="founder-image"
              />
              <h3>Bez Doe</h3>
              <p className="founder-role">CEO & Lead Instructor</p>
              <p className="founder-bio">
                10+ years experience in software development and education
              </p>
              <div className="social-links">
                <a href="#"><FaLinkedin /></a>
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaGithub /></a>
              </div>
            </article>

            {/* Founder 2 */}
            <article className="founder-card">
              <img
                src={Founder2}
                alt="Founder John Doe"
                className="founder-image"
              />
              <h3>Kaleb Doe</h3>
              <p className="founder-role">CEO & Lead Instructor</p>
              <p className="founder-bio">
                10+ years experience in software development and education
              </p>
              <div className="social-links">
                <a href="#"><FaLinkedin /></a>
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaGithub /></a>
              </div>
            </article>
            {/* Founder 3*/}
            <article className="founder-card">
              <img
                src={Founder3}
                alt="Founder John Doe"
                className="founder-image"
              />
              <h3>Sami Doe</h3>
              <p className="founder-role">CEO & Lead Instructor</p>
              <p className="founder-bio">
                10+ years experience in software development and education
              </p>
              <div className="social-links">
                <a href="#"><FaLinkedin /></a>
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaGithub /></a>
              </div>
            </article>
          </div>

          <div className="org-story">
            <h2>Our Story</h2>
            <p>
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
            ></iframe>
          </div>
        </div>

        <Link to="/courses" className="cta-btn">
          View Our Courses
        </Link>
      </div>
    </section>
  );
};

export default AboutUsBox;