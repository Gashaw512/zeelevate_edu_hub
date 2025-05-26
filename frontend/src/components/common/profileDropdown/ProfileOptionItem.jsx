
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const ProfileOptionItem = ({ option, closeDropdown, handleLogout }) => {
  const renderIcon = () => {
    if (typeof option.icon === 'string') {
      return <span>{option.icon}</span>; // Handle emojis or simple strings
    } else if (option.icon) {
      return <FontAwesomeIcon icon={option.icon} />;
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
        {renderIcon()}
        {option.name}
      </Link>
    );
  }

  return (
    <button
      onClick={() => {
        if (option.action === 'logout') {
          handleLogout();
        }
        closeDropdown();
      }}
      className="w-full text-left flex items-center gap-3 px-4 py-2 text-richblack-100 hover:bg-richblack-700 text-sm"
    >
      {renderIcon()}
      {option.name}
    </button>
  );
};

ProfileOptionItem.propTypes = {
  option: PropTypes.shape({
    name: PropTypes.string.isRequired,
    path: PropTypes.string,
    icon: PropTypes.oneOfType([
      PropTypes.object, // for FontAwesome icon
      PropTypes.string, // for emoji or string icon
    ]),
    action: PropTypes.string,
  }).isRequired,
  closeDropdown: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired,
};

export default ProfileOptionItem;
// This component is a dropdown item for a user profile menu. It can either be a link to a different page or a button that performs an action (like logging out).