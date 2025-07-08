import {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
} from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  // faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faChevronDown,
  faChevronUp,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./AboutUsBox.module.css";

const FounderCard = ({
  name,
  role,
  bio,
  image,
  social = {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReadMoreButton, setShowReadMoreButton] = useState(false);
  const bioRef = useRef(null);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  useEffect(() => {
    if (bioRef.current) {
      const maxHeight = parseInt(getComputedStyle(bioRef.current).maxHeight, 10);
      const needsTruncation = bioRef.current.scrollHeight > maxHeight;
      setShowReadMoreButton(needsTruncation);
    }
  }, [bio]);

  const renderBio = Array.isArray(bio)
    ? bio.map((paragraph, index) => (
        <p key={index} className={styles.bioParagraph}>
          {paragraph}
        </p>
      ))
    : <p className={styles.bioParagraph}>{bio}</p>;

  const bioContentId = `bio-${name.replace(/\s+/g, "-").toLowerCase()}`;
  const hasSocialLinks = Object.values(social).some(Boolean);

  return (
    <div
      className={styles.founderCard}
      role="article"
      aria-labelledby={`${bioContentId}-name`}
    >
      {image && (
        <picture>
          <source srcSet={image} type="image/webp" />
          <img
            src={image}
            alt={`Portrait of ${name}`}
            className={styles.founderImage}
            loading="lazy"
            decoding="async"
            width="150"
            height="180"
          />
        </picture>
      )}

      <div className={styles.founderTextContent}>
        <h3 id={`${bioContentId}-name`} className={styles.founderName}>
          {name}
        </h3>

        {role && (
          <p className={styles.founderRole}>
            <FontAwesomeIcon icon={faUserTie} className={styles.roleIcon} />
            <span>{role}</span>
          </p>
        )}

        <div
          ref={bioRef}
          id={bioContentId}
          className={`${styles.founderBio} ${isExpanded ? styles.expanded : styles.collapsed}`}
          aria-live="polite"
        >
          {renderBio}
        </div>

        {showReadMoreButton && (
          <button
            type="button"
            onClick={toggleExpand}
            className={styles.readMoreButton}
            aria-expanded={isExpanded}
            aria-controls={bioContentId}
          >
            {isExpanded ? "Show Less" : "Read More"}
            <FontAwesomeIcon
              icon={isExpanded ? faChevronUp : faChevronDown}
              className={styles.readMoreIcon}
              aria-hidden="true"
            />
          </button>
        )}

        {hasSocialLinks && (
          <div className={styles.founderCardFooter}>
            <div
              className={styles.socialLinks}
              role="group"
              aria-label={`Social links for ${name}`}
            >
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} on LinkedIn`}
                  title={`${name} on LinkedIn`}
                >
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
              )}

              {/* Uncomment if Twitter is needed in the future
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} on Twitter`}
                  title={`${name} on Twitter`}
                >
                  <FontAwesomeIcon icon={faXTwitter} />
                </a>
              )} */}
            </div>
          </div>
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
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  image: PropTypes.string.isRequired,
  social: PropTypes.shape({
    linkedin: PropTypes.string,
    twitter: PropTypes.string,
  }),
};

export default memo(FounderCard);
