

// import React, { useState } from "react";
// import {
//   FaFacebookF,
//   FaTwitter,
//   FaLinkedinIn,
//   FaInstagram,
//   FaBars,
//   FaTimes,
// } from "react-icons/fa";
// import "./Demo.css";

// const Demo = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleMenu = () => setIsOpen(!isOpen);
//   const closeMenu = () => setIsOpen(false);

//   const scrollTo = (id) => {
//     const el = document.getElementById(id);
//     if (el) {
//       el.scrollIntoView({ behavior: "smooth" });
//     }
//     closeMenu();
//   };

//   return (
//     <div className="navbar-container">
//       <div className="social-icons">
//         <a href="#"><FaFacebookF /></a>
//         <a href="#"><FaTwitter /></a>
//         <a href="#"><FaLinkedinIn /></a>
//         <a href="#"><FaInstagram /></a>
//       </div>

//       <div className="navbar">
//         <div className="brand">ZEELEVATE</div>
//         <div className="menu-icon" onClick={toggleMenu}>
//           {isOpen ? <FaTimes /> : <FaBars />}
//         </div>

//         <ul className={`nav-links ${isOpen ? "open" : ""}`}>
//           {['home', 'about', 'services', 'team', 'contact'].map((link) => (
//             <li key={link}>
//               <button onClick={() => scrollTo(link)}>{link}</button>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Demo;


