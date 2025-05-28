// components/Feature/FeatureCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styles from './Feature.module.css'; // Make sure it imports the same module CSS

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className={styles.featureCard}> {/* Apply the main card style */}
      <div className={styles.iconContainer}> {/* New: Wrapper for the icon */}
        {icon}
      </div>
      <h3 className={styles.cardTitle}>{title}</h3> {/* Use cardTitle style */}
      <p className={styles.description}>{description}</p> {/* Use description style */}
      {/* If you want a CTA per card: */}
      {/* <a href="#" className={styles.featureCard__cta}>Learn More</a> */}
    </div>
  );
};

FeatureCard.propTypes = {
  icon: PropTypes.node.isRequired, // Can be a string (emoji) or a React component (FaIcon)
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default FeatureCard;