// src/hooks/useScrollToSection.js
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * A reusable hook for handling navigation and smooth scrolling to sections.
 * It intelligently decides whether to:
 * 1. Smoothly scroll to a section on the current page.
 * 2. Navigate to the homepage (if not already there) and then scroll to a section
 * by passing the target ID via `location.state`.
 * 3. Navigate to a completely different route.
 *
 * This hook requires a corresponding useEffect in the main layout/homepage component
 * (e.g., App.jsx or Home.jsx) to listen for `location.state.scrollTo` and perform the scroll.
 *
 * @returns {object} An object containing the `handleNavigationAndScroll` function.
 */
export const useScrollToSection = () => {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Main handler for all navigation links (both scroll and route based).
   * It centralizes the logic for preventing default events, navigating,
   * and executing callbacks.
   *
   * @param {Event} event - The native DOM click event object.
   * @param {string} targetPath - The destination path (e.g., 'home', 'about' for scroll links, or '/blog', '/signup' for route links).
   * @param {string} linkType - The type of link: 'scroll' or 'route'.
   * @param {function} [onCloseMenuCallback] - Optional callback function to execute (e.g., to close a mobile menu).
   */
  const handleNavigationAndScroll = useCallback((event, targetPath, linkType, onCloseMenuCallback) => {
    // Prevent default browser behavior (e.g., hash jump for <a>, page reload for <Link>)
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    if (linkType === 'route') {
      // For a standard route link (e.g., to /signup, /blog)
      navigate(targetPath);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top of the new page
    } else if (linkType === 'scroll') {
      // For an in-page scroll link (e.g., to #about, #contact)
      const targetElement = document.getElementById(targetPath); // targetPath is the ID here

      if (location.pathname !== '/') {
        // If not on the homepage, navigate to the homepage and pass scroll target via state
        navigate('/', { state: { scrollTo: targetPath } });
      } else if (targetElement) {
        // If already on the homepage and element exists, perform direct smooth scroll
        targetElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback: if element not found on current page (shouldn't happen for valid IDs on homepage)
        console.warn(`useScrollToSection: Target element with ID "${targetPath}" not found on the current page.`);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top as fallback
      }
    } else {
      console.error(`useScrollToSection: Unknown link type "${linkType}" for path "${targetPath}".`);
    }

    // Execute the provided callback if it exists (e.g., close mobile menu)
    if (onCloseMenuCallback) {
      onCloseMenuCallback();
    }
  }, [location.pathname, navigate]);

  return { handleNavigationAndScroll };
};