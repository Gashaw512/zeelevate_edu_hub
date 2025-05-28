

  // src/data/founders.js
export const founders = [
  {
    name: "John Doe",
    role: "CEO & Co-Founder",
    bio: "John is a visionary leader with over 15 years of experience...",
    image: "/images/Bez.JPG",
    social: { // <--- ENSURE 'social' IS ALWAYS HERE
      linkedin: "https://linkedin.com/in/johndoe_example",
      twitter: "https://twitter.com/johndoe_example",
    }
  },
  {
    name: "Jane Smith",
    role: "CTO & Co-Founder",
    bio: "Jane leads our tech initiatives, ensuring cutting-edge solutions...",
    image: "/images/Kaleb.JPG", 
    social: { // <--- AND HERE
      linkedin: "https://linkedin.com/in/janesmith_example",
      twitter: "", // If they don't have Twitter, leave it empty or remove the key.
    }
  },
  {
    name: "Alice Johnson",
    role: "Chief Learning Officer",
    bio: "Alice designs our curriculum with a focus on practical application...",
     image: "/images/Sam.JPG",
    social: { // <--- AND HERE
      linkedin: "https://linkedin.com/in/alicejohnson_example",
      // If no Twitter, you can simply omit the 'twitter' key,
      // or set it to an empty string: twitter: "",
    }
  },
  // Add more founders, ensuring each has a 'social' object
];
  