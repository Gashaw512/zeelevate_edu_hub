import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import ProfileOptionItem from './ProfileOptionItem';
import { defaultProfileDropdownOptions } from "../../../data/navbarLinks";

const ProfileDropdown = ({ avatarUrl = "/default-profile.png", customOptions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const profileOptions = customOptions || defaultProfileDropdownOptions;
  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 hover:bg-richblack-700 p-2 rounded-full transition-colors"
      >
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-richblack-800 border border-richblack-700 rounded-lg shadow-lg py-2 z-50">
          {profileOptions.map((option) => (
            <ProfileOptionItem
              key={option.name}
              option={option}
              closeDropdown={closeDropdown}
              handleLogout={handleLogout}
            />
          ))}
        </div>
      )}
    </div>
  );
};

ProfileDropdown.propTypes = {
  avatarUrl: PropTypes.string,
  customOptions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string,
      icon: PropTypes.oneOfType([
        PropTypes.object, // for FontAwesome icon object
        PropTypes.string, // for emoji or string
      ]),
      action: PropTypes.string,
    })
  ),
};

export default ProfileDropdown;
