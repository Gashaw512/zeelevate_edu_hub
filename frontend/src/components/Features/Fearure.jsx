// components/Feature/Feature.jsx
import React from 'react';
import FeatureCard from './FeatureCard'; // Ensure this component is well-defined and styled
import styles from './Feature.module.css'; // Using CSS Modules for this component

/**
 * Feature Section Component
 *
 * A clean, responsive, and visually appealing "Why Choose Us" section
 * designed to highlight core benefits of Zeelevate Academy.
 */
const Feature = () => {
  return (
    <section id="approach-section" className={styles.featuresSection}>
      <div className={styles.featuresContainer}>
        <h2 className={styles.featuresHeading}>Our Approach to Empowering Digital Futures</h2> {/* New heading */}
        <p className={styles.featuresSubtitle}>
          At Zeelevate, we've designed our learning experience around principles that guarantee your success.
        </p>
        <div className={styles.featuresGrid}>
          <FeatureCard
            icon="🔗" // Chain, interconnected
            title="Integrated & Holistic Curriculum"
            description="Our courses seamlessly blend technical, digital, and financial literacy, providing a well-rounded foundation for modern life."
          />
          <FeatureCard
            icon="🗣️" // Speech bubble, community
            title="Interactive & Collaborative Environment"
            description="Engage with peers and instructors through dynamic projects, discussions, and real-time support."
          />
          <FeatureCard
            icon="📈" // Upward trend
            title="Continuous Skill Evolution"
            description="Our content is regularly updated to reflect the latest industry trends, ensuring your skills remain relevant and in-demand."
          />
        </div>
      </div>
    </section>
  );
};

export default Feature;