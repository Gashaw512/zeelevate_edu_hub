// src/components/Common/NavItem.jsx
// (Consider creating a 'Common' folder for highly reusable components)
import React from 'react';
import PropTypes from 'prop-types';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import styles from '../Navbar/Navbar.module.css'; // Assuming shared styles for links

/**
 * NavItem Component
 * Renders a single navigation link, abstracting between react-scroll's ScrollLink
 * and react-router-dom's RouterLink based on the 'type' prop.
 * It passes the native event directly to the onClick handler prop.
 *
 * @param {object} props - Component props.
 * @param {string} props.label - The text displayed for the link.
 * @param {string} [props.id] - The HTML ID for scroll targets (required for type='scroll').
 * @param {string} [props.to] - The URL path for route targets (required for type='route').
 * @param {'scroll' | 'route'} props.type - The type of link: 'scroll' or 'route'.
 * @param {object} [props.linkProps] - Additional props to pass to the underlying Link component.
 * @param {function(Event, string, string, string): void} props.onClickHandler -
 * The callback function for clicks. Signature: `(event, id, to, type)`.
 * The actual logic for navigation/scrolling and preventDefault should live in this handler.
 * @returns {JSX.Element | null} The rendered link component or null if misconfigured.
 */
const NavItem = React.memo(({ label, id, to, type, linkProps, onClickHandler }) => {

  // Determine the 'path' that the parent handler expects (ID for scroll, 'to' for route)
  const navPath = type === 'scroll' ? id : to;

  const handleClick = (e) => {
    // Pass the native event object and all relevant link data directly to the handler
    if (onClickHandler) {
      onClickHandler(e, navPath, type); // Simplified: path, event, type
    }
  };

  if (type === 'route' && to) {
    return (
      <RouterLink
        to={to}
        onClick={handleClick}
        className={styles.mainNavLink}
        {...linkProps}
      >
        {label}
      </RouterLink>
    );
  } else if (type === 'scroll' && id) {
    return (
      <ScrollLink
        to={id} // react-scroll 'to' expects the ID
        smooth={true}
        duration={500}
        spy={true}
        onClick={handleClick}
        className={styles.mainNavLink}
        {...linkProps}
      >
        {label}
      </ScrollLink>
    );
  }

  // Fallback for invalid link configurations (good for debugging)
  console.warn(`NavItem: Invalid link configuration for label "${label}". Requires 'id' for scroll or 'to' for route, and a 'type' prop.`);
  return null;
});

NavItem.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string,
  to: PropTypes.string,
  type: PropTypes.oneOf(['scroll', 'route']).isRequired,
  linkProps: PropTypes.object,
  // Adjusted propType to match simplified handleClick call: (event, path, type)
  onClickHandler: PropTypes.func.isRequired,
};

NavItem.displayName = 'NavItem';

export default NavItem;