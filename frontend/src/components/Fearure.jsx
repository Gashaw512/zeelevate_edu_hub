import React from 'react';
import './feature.css';
import FeatureCard from './FeatureCard';

/**
 * Feature Section Component
 *
 * A clean, responsive, and visually appealing "Why Choose Us" section.
 */
const Feature = () => {
  return (
    <section id="features" className="feature-section">
      <div className="feature-container">
        <h2 className="feature-heading">Why Choose Zeelevate?</h2>
        <div className="feature-grid">
          <FeatureCard
            icon="🎓"
            title="High-Quality Education"
            description="Master programming, digital literacy, financial skills, and more — all at your own pace."
          />
          <FeatureCard
            icon="🌍"
            title="Inclusive Learning"
            description="Designed for teens and adults — accessible, affordable, and flexible."
          />
          <FeatureCard
            icon="🚀"
            title="Career Growth"
            description="Unlock opportunities with certifications that help you thrive in the modern world."
          />
          
        </div>
      </div>
    </section>
  );
};

export default Feature;