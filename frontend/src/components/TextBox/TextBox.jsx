import { Link } from "react-router-dom";
import styles from "./TextBox.module.css";
import { useScrollToSection } from "../../hooks/useScrollToSection";

const TextBox = () => {
  const { handleNavLinkClick } = useScrollToSection();

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroImageContainer}>
        <picture>
          <source srcSet="/images/bg2.avif" type="image/avif" />
          <source srcSet="/images/bg2.webp" type="image/webp" />
          <img
            src="/images/bg2-960.jpg" // Use smaller fallback as default
            alt="Empowering Digital Learning with Zeelevate Academy"
            className={styles.heroBackgroundImage}
            loading="lazy" // Switch to lazy to prevent render-blocking
            decoding="async"
            width="1600"
            height="900"
            srcSet="
              /images/bg2-640.jpg 640w,
              /images/bg2-960.jpg 960w,
              /images/bg2-1280.jpg 1280w,
              /images/bg2-1600.jpg 1600w"
            sizes="(max-width: 768px) 100vw,
                   (max-width: 1200px) 80vw,
                   1600px"
          />
        </picture>
        <div className={styles.heroImageOverlay}></div>
      </div>

      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          Welcome to <span className={styles.heroTitleHighlight}>Zeelevate</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Empowering your journey in the digital age through inclusive education and transformative learning experiences.
        </p>
        <div className={styles.ctaButtonsContainer}>
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
