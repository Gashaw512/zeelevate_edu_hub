// src/hooks/useScrollToSection.js
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * A reusable hook for handling navigation and smooth scrolling to sections.
 * It intelligently decides whether to:
 * 1. Smoothly scroll to a section on the current page.
 * 2. Navigate to a new page (including the homepage) and then scroll to a section
 * by passing the target ID via `location.state.scrollTo`.
 *
 * This hook now includes an internal useEffect to automatically scroll to
 * targets specified in `location.state.scrollTo` on any page load/navigation.
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
   * @param {'scroll' | 'route'} linkType - The type of link: 'scroll' or 'route'.
   * @param {function} [onCloseMenuCallback] - Optional callback function to execute (e.g., to close a mobile menu).
   * @param {string} [scrollToId] - Optional: The ID of the element to scroll to on the target page.
   */
  const handleNavigationAndScroll = useCallback((event, targetPath, linkType, onCloseMenuCallback, scrollToId = null) => {
    // Prevent default browser behavior (e.g., hash jump for <a>, page reload for <Link>)
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    if (linkType === 'route') {
      // For a standard route link (e.g., to /signup, /blog)
      // Pass scrollToId via state if provided
      navigate(targetPath, { state: { scrollTo: scrollToId } });
      // The scroll will be handled by the useEffect below or in the target page
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

  // Effect to handle scrolling when `location.state.scrollTo` is present
  useEffect(() => {
    if (location.state?.scrollTo) {
      const targetId = location.state.scrollTo;
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // Add a small delay to ensure the DOM has fully rendered
        // after a route transition before attempting to scroll.
        const timer = setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Optional: Clear the state after scrolling to prevent re-scrolling
          // if the user navigates back and forth without explicit scroll intent.
          // navigate(location.pathname, { replace: true, state: {} }); // This clears the state
        }, 100); // 100ms delay, adjust if needed

        return () => clearTimeout(timer);
      } else {
        console.warn(`useScrollToSection: Target element with ID "${targetId}" not found on the current page after route change.`);
      }
    } else {
      // If no specific scroll target in state, ensure page is at top on new route,
      // unless we came from a 'scroll' link that handles it.
      // This prevents unwanted auto-scrolling on every route change if not intended.
      // You might want to remove this if you rely solely on `location.state.scrollTo` for all scrolls.
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.state, location.pathname, navigate]); // Depend on location.state and pathname

  return { handleNavigationAndScroll };
};