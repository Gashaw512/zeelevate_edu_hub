import { Link } from "react-router-dom";
import styles from "./TextBox.module.css"; // Correctly import CSS Modules
import { useScrollToSection } from "../../utils/scrollUtils";

/**
 * Renders a prominent hero section for the landing page,
 * featuring a background image, a main title, a descriptive subtitle,
 * and calls to action for joining and learning more about the organization.
 */
const TextBox = () => {
  const { handleNavLinkClick } = useScrollToSection();

  return (
    <section className={styles.heroSection}>
      {/* Background Image Container with Overlay */}
      <div className={styles.heroImageContainer}>
        <img
          src="/images/bg2.jpeg" // Ensure this path is correct and the image is high-quality
          alt="Empowering Digital Learning with Zeelevate Academy"
          className={styles.heroBackgroundImage}
        />
        {/* Added a subtle overlay for depth and text contrast */}
        <div className={styles.heroImageOverlay}></div>
      </div>

      {/* Main Content Overlay */}
      <div className={styles.heroContent}>
        {" "}
        {/* Renamed for clarity */}
        <h1 className={styles.heroTitle}>
          Welcome to{" "}
          <span className={styles.heroTitleHighlight}>Zeelevate</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Empowering your journey in the digital age through inclusive education
          and transformative learning experiences.
        </p>
        {/* Call to Action Buttons */}
        <div className={styles.ctaButtonsContainer}>
          {" "}
          {/* New container for buttons */}
          <Link to="/signup" className={styles.ctaPrimaryButton}>
            Join Us Now! <span className={styles.ctaArrow}>→</span>
          </Link>
          {/* <Link to="#about" className={styles.ctaSecondaryButton}>
         
          </Link> */}
          <button
            className={styles.ctaSecondaryButton}
            onClick={(e) => handleNavLinkClick("about", e)}
          >
            Learn More About Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default TextBox;
