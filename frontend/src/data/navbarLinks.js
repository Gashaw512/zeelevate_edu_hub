
import { faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';

export const navLinks = [
  {
    id: "home", // ID for scroll, and will be the 'path' for the hook if type is 'scroll'
    label: 'Home',
    type: 'scroll', // Explicitly define type
    linkProps: { smooth: true, offset: 0, duration: 500 }, // react-scroll props
  },
  {
    id: 'about',
    label: 'About Us',
    type: 'scroll', // Explicitly define type
    linkProps: { smooth: true, offset: -260, duration: 500 },
  },
  {
    id: 'service',
    label: 'Courses',
    type: 'scroll', // Explicitly define type
    linkProps: { smooth: true, offset: -150, duration: 500 },
  },
 
  {
    id: 'contact',
    label: 'Contact',
    type: 'scroll', // Explicitly define type
    linkProps: { smooth: true, offset: -260, duration: 500 },
  },
  // Example of a route link (if you had one in your static nav)
  // {
  //   label: 'Blog',
  //   to: '/blog', // Route path for React Router
  //   type: 'route', // Explicitly define type
  // },
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