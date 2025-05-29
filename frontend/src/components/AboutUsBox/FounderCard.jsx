// src/components/AboutUs/FounderCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import styles from './AboutUsBox.module.css';

const FounderCard = ({ name, role, bio, image, social }) => {
  const safeSocial = social || {};

  return (
    <div className={styles.founderCard}>
      <img src={image} alt={name} className={styles.founderImage} />
      <h3 className={styles.founderName}>{name}</h3>
      <p className={styles.founderRole}>{role}</p>
      <div className={styles.founderBio}>
        {Array.isArray(bio) ? (
          bio.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
        ) : (
          <p>{bio}</p>
        )}
      </div>
      <div className={styles.socialLinks}>
        {safeSocial.linkedin && (
          <a href={safeSocial.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn profile of ${name}`}>
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
        )}
        {safeSocial.twitter && safeSocial.twitter !== "" && (
          <a href={safeSocial.twitter} target="_blank" rel="noopener noreferrer" aria-label={`Twitter profile of ${name}`}>
            <FontAwesomeIcon icon={faTwitter} />
          </a>
        )}
      </div>
    </div>
  );
};

FounderCard.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string,
  bio: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  image: PropTypes.string.isRequired,
  social: PropTypes.shape({
    linkedin: PropTypes.string,
    twitter: PropTypes.string,
  }),
};

export default FounderCard;
