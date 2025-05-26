import React from "react";
import "./Team.css"; // Assuming you have a Team.css file for styling
import TeamMemberCard from "./TeamMemberCard"; // Create this component

const Team = () => {
  const teamMembers = [
    {
      name: "Dr. [Founder's Name]",
      title: "Founder & CEO",
      image: "/images/founder.jpg", // Replace with actual image path
      bio: "Visionary leader with a passion for empowering the next generation through education and technology.",
      linkedin: "https://www.linkedin.com/in/[founder-linkedin]", // Replace with actual LinkedIn URL
      // Optional: twitter: "https://twitter.com/[founder-twitter]",
    },
    {
      name: "[Lead Instructor's Name]",
      title: "Lead Instructor, [Area of Expertise]",
      image: "/images/instructor1.jpg", // Replace with actual image path
      bio: "Experienced educator dedicated to providing engaging and effective learning experiences in [Area of Expertise].",
      linkedin: "https://www.linkedin.com/in/[instructor1-linkedin]", // Replace with actual LinkedIn URL
      // Optional: twitter: "https://twitter.com/[instructor1-twitter]",
    },
    // Add more team members here following the same structure
    {
      name: "[Another Team Member's Name]",
      title: "[Their Title/Role]",
      image: "/images/team_member2.jpg", // Replace with actual image path
      bio: "[A brief and informative bio about their contribution to Zeelevate.]",
      linkedin: "https://www.linkedin.com/in/[team-member2-linkedin]", // Replace with actual LinkedIn URL
      // Optional: twitter: "https://twitter.com/[team-member2-twitter]",
    },
    {
      name: "[Yet Another Team Member's Name]",
      title: "[Their Title/Role]",
      image: "/images/team_member3.jpg", // Replace with actual image path
      bio: "[A brief and informative bio about their contribution to Zeelevate.]",
      linkedin: "https://www.linkedin.com/in/[team-member3-linkedin]", // Replace with actual LinkedIn URL
      // Optional: twitter: "https://twitter.com/[team-member3-twitter]",
    },
  ];

  return (
    <section id="team" className="team-section">
      <div className="container">
        <div className="section-title">
          <h2>Meet Our Dedicated Team</h2>
          <p>Our passionate team is committed to providing you with the best learning experience and support.</p>
        </div>
        <div className="team-members-grid">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={index} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;