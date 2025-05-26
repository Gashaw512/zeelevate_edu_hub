// src/data/navbarLinks.js
import { faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';

// ---
// Navigation Links for the main Navbar (Static, non-auth related)
// Used by: NavItem.jsx (via Navbar.jsx)
// ---
export const navLinks = [
  {
    id: 'hero', // For react-scroll
    label: 'Home',
    linkProps: { smooth: true, offset: 0, duration: 500 },
  },
  {
    id: 'about',
    label: 'About Us',
    linkProps: { smooth: true, offset: -260, duration: 500 },
  },
  {
    id: 'service',
    label: 'Services',
    linkProps: { smooth: true, offset: -150, duration: 500 },
  },
  {
    id: 'team',
    label: 'Team',
    linkProps: { smooth: true, offset: -260, duration: 500 },
  },
  {
    id: 'contact',
    label: 'Contact',
    linkProps: { smooth: true, offset: -260, duration: 500 },
  },
  // 'Sign In' is intentionally omitted here as its rendering is dynamic
  // based on authentication state, handled by AuthNavigation.jsx.
];

// ---
// Default Options for the User Profile Dropdown
// Used by: ProfileDropdown.jsx
// ---
export const defaultProfileDropdownOptions = [
    {
      name: "My Profile",
      path: "my-profile", // Router path
      icon: faUser
    },
    {
      name: "Sign Out",
      action: "logout", // Special action key
      icon: faRightFromBracket
    }
  ];