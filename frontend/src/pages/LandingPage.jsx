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
import { useScrollToSection } from '../hooks/useScrollToSection';

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

   useScrollToSection(); // This auto-scrolls on mount if location.state.scrollTo exists



  // THIS IS THE CRUCIAL PART FOR `location.state.scrollTo`


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
