import { useLocation, useNavigate } from 'react-router-dom';

export const useScrollToSection = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavLinkClick = (path, event, onCloseMenu) => {
    event.preventDefault();
    const targetId = path.startsWith('#') ? path.substring(1) : path;

    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: targetId } });
      if (onCloseMenu) {
        onCloseMenu();
      }
    } else {
      scrollToSection(targetId);
      if (onCloseMenu) {
        onCloseMenu();
      }
    }
  };

  return { scrollToSection, handleNavLinkClick };
};