// Data file for NavBar links and other links
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

export const navbarLinks = [

    {
      name: "Home",
      path: "/",
      // icon: "🏡"
    },
    {
      name: "About",
      path: "/about",
      // icon: "ℹ️"
    },
    {
      name: "Courses",
      path: "/course",
      // icon: "📚"
    },
    {
      name: "Blog",
      path: "/blog",
      // icon: "📝"
    },
    {
      name: "Contact",
      path: "/contact",
      // icon: "📞"
    }
  ];
  
  export const defaultProfileDropdownOptions = [
    {
      name: "My Profile",
      path: "my-profile",
      icon: "👤"
    },
    {
      name: "Sign Out",
      action: "logout", // It will implement dynamically for latter
      icon: faRightFromBracket
    }
  ];

  