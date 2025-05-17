import Header from "../components/Header/Header";
import Course from "./Course"
import Facilities from "../components/Facilities/Facilities";
import Cta from "../components/Cta/Cta";
import Testimonials from "../components/Testimonials/Testimonials";
import Footer from "../components/Footer/Footer";

import AboutSection from "../pages/About";
import BlogSection from "../pages/Blog";
import ContactSection from "../pages/Contact";

import { useEffect } from "react";
import { useLocation } from "react-router-dom"; 
// import Home from "./Home";
import Home from "../components/Home/Home"; // Adjust the import path as necessary

const HomePageWithScroll = () => {

    const location = useLocation();

    useEffect(() => {
      if (location.state?.scrollTo) {
        setTimeout(() => {
          const element = document.getElementById(location.state.scrollTo);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
    
          // Clear state after scroll
          window.history.replaceState({}, document.title);
        }, 100); // Delay can be adjusted (100–300ms works well)
      }
    }, [location]);

  


  return (
    // This is the main HomePage component that includes all sections
    <>
        <Header />

      <section id="home">
        <Home/>
      </section>

      <section id="about">
        <AboutSection />
      </section>

      <section id="course">
        <Course />
      </section>

      <section id="facilities"> {/* Add Facilities as a section */}
        <Facilities />
      </section>

      <Cta /> {/* Cta doesn't necessarily need to be a full section with an ID if you don't want to scroll directly to it from the main nav */}

      <section id="testimonials">
        <Testimonials />
      </section>

      <section id="blog">
        <BlogSection />
      </section>

      <section id="contact">
        <ContactSection />
      </section>

      <Footer /> {/* Footer is usually at the very bottom */}
    </>
  );
};

export default HomePageWithScroll;