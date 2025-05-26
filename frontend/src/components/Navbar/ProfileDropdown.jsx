// src/components/Navbar/ProfileDropdown.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons"; // <-- Ensure faUser is imported here!
import { defaultProfileDropdownOptions } from "../../data/navbarLinks";
import { useAuth } from "../../context/AuthContext";

/**
 * ProfileDropdown Component
 * Displays a user's avatar (image or default icon) and, when clicked,
 * reveals a dropdown menu with profile-related options and a logout action.
 *
 * @param {object} props - The component's props.
 * @param {string} [props.avatarUrl] - The URL of the user's avatar image. If null/undefined, a default icon will be used.
 * @param {function} props.onLinkClick - Function to call when a dropdown item is clicked (e.g., to close mobile menu).
 * @returns {JSX.Element} The ProfileDropdown component.
 */
const ProfileDropdown = React.memo(({ avatarUrl, onLinkClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { logout } = useAuth();

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const handleItemClick = useCallback(() => {
    setIsOpen(false); // Close dropdown on item click
    onLinkClick();    // Also signal to close parent mobile menu if applicable
  }, [onLinkClick]);

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      {avatarUrl ? ( // If avatarUrl is provided (truthy)
        <img
          src={avatarUrl}
          alt="User Profile Avatar"
          className="profile-avatar"
          onClick={toggleDropdown}
          role="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          tabIndex="0"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleDropdown();
            }
          }}
        />
      ) : ( // If avatarUrl is null/undefined, render the FontAwesome user icon
        <div
          className="profile-avatar profile-avatar-icon" // Add a class for styling the icon div
          onClick={toggleDropdown}
          role="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          tabIndex="0"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleDropdown();
            }
          }}
        >
          <FontAwesomeIcon icon={faUser} /> {/* Render the FontAwesome user icon */}
        </div>
      )}

      {isOpen && (
        <ul className="dropdown-menu" role="menu">
          {defaultProfileDropdownOptions.map((option) => (
            <li key={option.name} role="none">
              {option.action === "logout" ? (
                <button
                  onClick={() => {
                    logout();
                    handleItemClick();
                  }}
                  className="dropdown-item-button"
                  role="menuitem"
                >
                  {typeof option.icon === "object" ? (
                    <FontAwesomeIcon icon={option.icon} />
                  ) : (
                    option.icon && <span className="icon-text">{option.icon}</span>
                  )}{" "}
                  {option.name}
                </button>
              ) : (
                <Link
                  to={`/${option.path}`}
                  onClick={handleItemClick}
                  className="dropdown-item-link"
                  role="menuitem"
                >
                  {typeof option.icon === "object" ? (
                    <FontAwesomeIcon icon={option.icon} />
                  ) : (
                    option.icon && <span className="icon-text">{option.icon}</span>
                  )}{" "}
                  {option.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

ProfileDropdown.propTypes = {
  avatarUrl: PropTypes.string, // <-- Changed to NOT be required
  onLinkClick: PropTypes.func.isRequired,
};

ProfileDropdown.displayName = 'ProfileDropdown';

export default ProfileDropdown;