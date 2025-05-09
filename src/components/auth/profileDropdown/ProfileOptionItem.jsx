// src/components/common/ProfileOptionItem.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router-dom';

const ProfileOptionItem = ({ option, closeDropdown, handleLogout }) => {
  const renderIcon = () => {
    if (typeof option.icon === 'string') {
      return <span>{option.icon}</span>; // Handle emoji or other string icons
    } else if (option.icon) {
      return <FontAwesomeIcon icon={option.icon} />; // Render Font Awesome icon object
    }
    return null;
  };


  if (option.path) {
    return (
      <Link
        to={option.path}
        onClick={closeDropdown}
        className="flex items-center gap-3 px-4 py-2 text-richblack-100 hover:bg-richblack-700 text-sm"
      >
        <span>{option.icon}</span>
        {option.name}
      </Link>
    );
  }

  return (
    <button
      onClick={() => {
        if (option.action === 'logout') {
          handleLogout(); // Call the passed handleLogout function
        }
        closeDropdown();
      }}
      className="w-full text-left flex items-center gap-3 px-4 py-2 text-richblack-100 hover:bg-richblack-700 text-sm"
    >
      <span>{renderIcon()}</span>
      {option.name}
    </button>
  );
};

export default ProfileOptionItem;