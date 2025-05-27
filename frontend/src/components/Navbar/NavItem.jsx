// src/components/Navbar/NavItem.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';

const NavItem = React.memo(({ label, id, to, linkProps, onClickHandler }) => {
  const handleClick = (e) => {
    if (id) {
      onClickHandler(id, e);
    } else {
      onClickHandler();
    }
  };

  if (to) {
    // Render a React Router Link
    return (
      <RouterLink
        to={to}
        onClick={handleClick}
        className="main-nav-link" 
        {...linkProps}
      >
        {label}
      </RouterLink>
    );
  } else if (id) {
    // Render a react-scroll ScrollLink
    return (
      <ScrollLink
        to={id}
        onClick={(e) => handleClick(e)}
        className="main-nav-link" // <-- ADDED CLASS HERE
        {...linkProps}
      >
        {label}
      </ScrollLink>
    );
  }

  console.warn(`NavItem: Invalid link configuration for label "${label}". Requires either 'id' or 'to'.`);
  return null;
});

NavItem.propTypes = {
  label: PropTypes.string.isRequired,
  id: PropTypes.string,
  to: PropTypes.string,
  linkProps: PropTypes.object,
  onClickHandler: PropTypes.func.isRequired,
};

NavItem.displayName = 'NavItem';

export default NavItem;