// src/components/AboutUs/FounderCard.jsx
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import styles from './AboutUsBox.module.css';

const FounderCard = ({ name, role, bio, image, social }) => {
  const effectiveSocial = social || {};
  const [isExpanded, setIsExpanded] = useState(false);
  const bioRef = useRef(null);
  const [showReadMoreButton, setShowReadMoreButton] = useState(false);

  const fullBioContent = Array.isArray(bio) ? bio.map((p, i) => <p key={i} className={styles.bioParagraph}>{p}</p>) : <p className={styles.bioParagraph}>{bio}</p>;

  useEffect(() => {
    if (bioRef.current) {
      // Adjusted collapsed height for current design (match CSS)
      const collapsedHeight = 120;
      if (bioRef.current.scrollHeight > collapsedHeight) {
        setShowReadMoreButton(true);
      } else {
        setShowReadMoreButton(false);
      }
    }
  }, [fullBioContent]);

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  const bioContentId = `bio-content-${name.replace(/\s+/g, '-')}`;

  return (
    <div className={styles.founderCard}>
      {/* Image on the left */}
      {image && <img src={image} alt={name} className={styles.founderImage} />}

      {/* Text content wrapper on the right */}
      <div className={styles.founderTextContent}>
        <h3 className={styles.founderName}>{name}</h3>
        {role && <p className={styles.founderRole}>{role}</p>}

        <div
          ref={bioRef}
          id={bioContentId}
          className={`${styles.founderBio} ${isExpanded ? styles.expanded : styles.collapsed}`}
        >
          {fullBioContent}
        </div>

        {showReadMoreButton && (
          <button
            onClick={toggleExpand}
            className={styles.readMoreButton}
            aria-expanded={isExpanded}
            aria-controls={bioContentId}
          >
            {isExpanded ? 'Show Less' : 'Read More'}
            <FontAwesomeIcon
              icon={isExpanded ? faChevronUp : faChevronDown}
              className={styles.readMoreIcon}
            />
          </button>
        )}

        {/* New Founder Card Footer */}
        <div className={styles.founderCardFooter}>
          <hr className={styles.footerSeparator} /> {/* The dotted line */}
          <div className={styles.socialLinks}>
            {effectiveSocial.linkedin && (
              <a href={effectiveSocial.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn profile of ${name}`}>
                <FontAwesomeIcon icon={faLinkedin} />
              </a>
            )}
            {effectiveSocial.twitter && effectiveSocial.twitter !== "" && (
              <a href={effectiveSocial.twitter} target="_blank" rel="noopener noreferrer" aria-label={`Twitter profile of ${name}`}>
                <FontAwesomeIcon icon={faTwitter} />
              </a>
            )}
          </div>
        </div>
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