import { Link } from "react-router-dom";
import styles from "./TextBox.module.css";
import { useScrollToSection } from "../../hooks/useScrollToSection";

const TextBox = () => {
  const { handleNavLinkClick } = useScrollToSection();
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroImageContainer}>
        <picture>
          {/* AVIF and WebP sources for modern browsers */}
          <source srcSet="/images/bg2.avif" type="image/avif" />
          <source srcSet="/images/bg2.webp" type="image/webp" />
          <img
            src="/images/bg2-960.jpg" // Fallback for browsers that don't support <picture> or specific types
            alt="Empowering Digital Learning with Zeelevate Academy"
            className={styles.heroBackgroundImage}
            loading="lazy" // Defer loading until image is near viewport
            decoding="async" // Allow decoding off the main thread
            width="1600" // Intrinsic width for aspect ratio calculation
            height="900" // Intrinsic height for aspect ratio calculation
            srcSet="
              /images/bg2-640.jpg 640w,
              /images/bg2-960.jpg 960w,
              /images/bg2-1280.jpg 1280w,
              /images/bg2-1600.jpg 1600w"
            // Corrected `sizes` attribute for optimal image loading
            sizes="(max-width: 767px) 100vw, /* On viewports up to 767px, image is 100% viewport width */
                   (max-width: 1199px) 90vw, /* On viewports 768px to 1199px, image is 90% viewport width */
                   1600px" /* Default: image is 1600px wide */
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