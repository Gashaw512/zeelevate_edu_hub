// src/components/AboutUs/FounderCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import styles from './AboutUsBox.module.css'; // Import the same CSS Module

const FounderCard = ({ name, role, bio, image, social }) => {
  // Ensure 'social' is an object, default to an empty object if undefined
  const safeSocial = social || {};

  return (
    <div className={styles.founderCard}>
      <img src={image} alt={name} className={styles.founderImage} />
      <h3 className={styles.founderName}>{name}</h3>
      <p className={styles.founderRole}>{role}</p>
      <p className={styles.founderBio}>{bio}</p>
      <div className={styles.socialLinks}>
        {/* Use optional chaining for safe access */}
        {safeSocial.linkedin && (
          <a href={safeSocial.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn profile of ${name}`}>
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
        )}
        {safeSocial.twitter && (
          <a href={safeSocial.twitter} target="_blank" rel="noopener noreferrer" aria-label={`Twitter profile of ${name}`}>
            <FontAwesomeIcon icon={faTwitter} />
          </a>
        )}
        {/* Add more social icons as needed */}
      </div>
    </div>
  );
};

FounderCard.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  bio: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  // Make social an optional prop with a default empty object
  social: PropTypes.shape({
    linkedin: PropTypes.string,
    twitter: PropTypes.string,
  }),
};

// Add a default prop for 'social' if it's completely missing
// This helps if the prop isn't even passed in at all, making the component more robust.
FounderCard.defaultProps = {
  social: {},
};


export default FounderCard;