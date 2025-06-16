import { Link } from "react-router-dom";
import styles from "./TextBox.module.css"; // Correctly import CSS Modules
import { useScrollToSection } from "../../hooks/useScrollToSection";


const TextBox = () => {
  const { handleNavLinkClick } = useScrollToSection();

  return (
    <section className={styles.heroSection}>
    
      <div className={styles.heroImageContainer}>
        <img
          src="/images/bg2.jpeg" 
          alt="Empowering Digital Learning with Zeelevate Academy"
          className={styles.heroBackgroundImage}
        />
     
        <div className={styles.heroImageOverlay}></div>
      </div>

      
      <div className={styles.heroContent}>
        {" "}
     
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
          <Link
            to="#about"
            className={styles.ctaSecondaryButton}
            onClick={(e) => handleNavLinkClick("about", e)}
          >
            Learn More About Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TextBox;
