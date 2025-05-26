import React from "react";
import "./TeamMemberCard.css"; // Create this CSS file

const TeamMemberCard = ({ member }) => {
  return (
    <div className="team-member-card">
      <div className="member-image">
        <img src={member.image} alt={member.name} />
      </div>
      <div className="member-info">
        <h3 className="member-name">{member.name}</h3>
        <p className="member-title">{member.title}</p>
        <p className="member-bio">{member.bio}</p>
        <div className="member-social">
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
              {/* You can use an icon here, e.g., <FontAwesomeIcon icon={faLinkedin} /> */}
              LinkedIn
            </a>
          )}
          {member.twitter && (
            <a href={member.twitter} target="_blank" rel="noopener noreferrer">
              {/* You can use an icon here, e.g., <FontAwesomeIcon icon={faTwitter} /> */}
              Twitter
            </a>
          )}
          {/* Add other social media links as needed */}
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;