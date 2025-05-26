// import React from "react";
// import { Link } from "react-router-dom";
// import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";
// import "./AboutUsBox.css";

// export const BezImage = "/images/Bez.JPG";
// export const KalebImage = "/images/Kaleb.JPG";
// export const SamImage = "/images/Sam.JPG";

// const AboutUsBox = () => {
//   const founders = [
//     {
//       name: "Bez Doe",
//       role: "CEO & Lead Instructor",
//       bio: "With over a decade of experience in software development and tech education, Bez brings a visionary approach to teaching coding and innovation.",
//       image: BezImage,
//       linkedin: "#",
//       twitter: "#",
//       github: "#",
//     },
//     {
//       name: "Kaleb Doe",
//       role: "CTO & Lead Instructor",
//       bio: "Kaleb is an expert in financial modeling and data analysis, dedicated to helping learners understand the real-world applications of financial literacy.",
//       image: KalebImage,
//       linkedin: "#",
//       twitter: "#",
//       github: "#",
//     },
//     {
//       name: "Sami Doe",
//       role: "Head of Curriculum Development",
//       bio: "Sami has over 12 years of experience in designing impactful and accessible digital literacy programs for learners of all backgrounds.",
//       image: SamImage,
//       linkedin: "#",
//       twitter: "#",
//       github: "#",
//     },
//   ];

//   return (
//     <section className="about-us">
//       <div className="about-us-container">
//         <div className="about-content">
//           <h1 className="about-us-title">Meet the Team Behind Zeelevate</h1>
//           <div className="founder-profiles">
//             {founders.map((founder) => (
//               <FounderCard key={founder.name} {...founder} />
//             ))}
//           </div>

//           <div className="org-story">
//             <h2 className="org-story-title">Our Story & Vision</h2>
//             <p className="org-story-text">
//               Zeelevate was founded in 2023 with a mission to close the digital divide by equipping teens, adults, and parents with essential 21st-century skills. Our platform merges coding, financial literacy, and life skills to prepare learners for a digitally driven future.
//             </p>
//             <ul className="specializations">
//               <li>Python Programming & Web Development</li>
//               <li>Financial Literacy for Everyday Life</li>
//               <li>College Preparation & Planning Workshops</li>
//               <li>Digital Citizenship & Online Safety</li>
//             </ul>
//           </div>

//           <div className="video-section">
//             <iframe
//               src="https://www.youtube.com/embed/your-video-id"
//               title="Zeelevate Introduction"
//               allowFullScreen
//               className="intro-video"
//             />
//           </div>
//         </div>

//         <Link to="/courses" className="about-us-cta-btn">
//           View Our Courses
//         </Link>
//       </div>
//     </section>
//   );
// };

// const FounderCard = ({ name, role, bio, image, linkedin, twitter, github }) => (
//   <article className="founder-card">
//     <img src={image} alt={`Founder ${name}`} className="founder-image" />
//     <h3 className="founder-name">{name}</h3>
//     <p className="founder-role">{role}</p>
//     <p className="founder-bio">{bio}</p>
//     <div className="social-links">
//       <a href={linkedin} aria-label="LinkedIn"><FaLinkedin /></a>
//       <a href={twitter} aria-label="Twitter"><FaTwitter /></a>
//       <a href={github} aria-label="GitHub"><FaGithub /></a>
//     </div>
//   </article>
// );

// export default AboutUsBox;

import { Link } from "react-router-dom";
import FounderCard from "./FounderCard";
import OrgStory from "./OrgStory";
import IntroVideo from "./IntroVideo";
import { founders } from "../../data/founders"; // Adjust path as needed
import "./AboutUsBox.css";

const AboutUsBox = () => {
  return (
    <section className="about-us">
      <div className="about-us-container">
        <div className="about-content">
          <h1 className="about-us-title">Meet the Team Behind Zeelevate</h1>

          <div className="founder-profiles">
            {founders.map((founder) => (
              <FounderCard key={founder.name} {...founder} />
            ))}
          </div>

          <OrgStory />
          <IntroVideo />
        </div>

        <Link to="/courses" className="about-us-cta-btn">
          View Our Courses
        </Link>
      </div>
    </section>
  );
};

export default AboutUsBox;
