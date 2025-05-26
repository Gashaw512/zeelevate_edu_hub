import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TextBox.module.css';

/**
 * Renders a prominent hero section for the landing page,
 * featuring a background image, a main title, a descriptive subtitle,
 * and calls to action for joining and learning more about the organization.
 */
const TextBox = () => {
  return (
    <section className={styles.heroSection}>
      {/* Background Image Container */}
      <div className={styles.heroImageContainer}>
        <img
          src="/images/bg2.jpeg"
          alt="Empowering Digital Learning with Zeelevate"
          className={styles.heroBackgroundImage}
        />
      </div>

      {/* Main Content Overlay */}
      <div className={styles.heroContentOverlay}>
        <h1 className={styles.heroTitle}>
          Welcome to <span className={styles.heroTitleHighlight}>Zeelevate</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Empowering your journey in the digital age through inclusive education and transformative learning.
        </p>
        <Link to="/register" className={styles.ctaPrimaryButton}>
          Join Us Now! <span className={styles.ctaArrow}>→</span>
        </Link>
                {/* Secondary "About Us" Button */}
        <Link to="/about" className={styles.secondaryCta}>
          About US
        </Link>
      </div>

      {/* About Us Call to Action */}
      {/* <div className={styles.aboutUsCta}>
        <div className={styles.aboutUsCtaContent}>
          <h2 className={styles.aboutUsCtaTitle}>
            Learn more about our mission and values
          </h2>
          <Link to="/about" className={styles.aboutUsCtaButton}>
            About Zeelevate
          </Link>
        </div>
      </div> */}
    </section>
  );
};

export default TextBox;