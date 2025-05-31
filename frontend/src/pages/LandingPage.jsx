// Import Components
import  { useEffect } from 'react';
import Navbar from "../components/Navbar/Navbar";
import TextBox from "../components/TextBox/TextBox";
import Footer from "../components/Footer/Footer";
import Contact from "../components/ContactComponent/ContactComponent";
import About from "../components/AboutUsBox/AboutUsBox";
// import Team from "../components/Team/Team";
import { useLocation, useNavigate } from 'react-router-dom';
import Cta from "../components/Cta/Cta";
import Programs from "../components/Programs/Programs";
import Feature from "../components/Features/Fearure";

/**
 * LandingPage Component
 *
 * A clean, modular, and responsive landing page layout for Zeelevate.
 * - Hero section with overlay text
 * - Value proposition / Features
 * - Programs section
 * - Call-to-action
 * - About us
 * - Our team
 * - Testimonials
 * - Contact form
 * - Footer
 */
const LandingPage = () => {


const location = useLocation();
  const navigate = useNavigate();

  // THIS IS THE CRUCIAL PART FOR `location.state.scrollTo`
  useEffect(() => {
    // Check if there's a 'scrollTo' ID in the location state
    if (location.state && location.state.scrollTo) {
      const { scrollTo } = location.state;
      const targetElement = document.getElementById(scrollTo);

      if (targetElement) {
        // Add a small delay to ensure the DOM has fully rendered after navigation
        // before attempting to scroll. This is especially important when navigating
        // from a different route (e.g., /signup) back to the homepage.
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth' });

          // OPTIONAL: Clear the 'scrollTo' state to prevent re-scrolling
          // if the user refreshes the page or navigates away and then back.
          // This ensures a clean state and predictable scrolling behavior.
          // navigate(location.pathname, { replace: true, state: {} });
        }, 100);
      } else {
        console.warn(`App.jsx: Target section with ID "${scrollTo}" not found in the DOM.`);
      }

      // After attempting to scroll (or if element not found), clear the state to prevent
      // re-scrolling on subsequent renders or refreshes that don't involve navigation.
      // This is crucial for a clean user experience.
      // Make sure this only happens if the state was truly set for scrolling.
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]); // Depend on location.state and pathname

  return (
    <>
      <Navbar />

      <section id="home">
        <TextBox />
      </section>

      <section id="feature" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <Feature />
        </div>
      </section>
      <section id="service" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <Programs />
        </div>
      </section>

      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-[1px] opacity-70"></div>
      <Cta />

      <section id="about" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <About />
        </div>
      </section>

      {/* <section id="team" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <Team />
        </div>
      </section> */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <Contact />
        </div>
      </section>
      <Footer />
    </>
  );
};

export default LandingPage;
