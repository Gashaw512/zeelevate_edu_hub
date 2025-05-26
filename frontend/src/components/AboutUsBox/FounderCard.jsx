import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";

const FounderCard = ({ name, role, bio, image, linkedin, twitter, github }) => (
  <article className="founder-card">
    <img src={image} alt={`Founder ${name}`} className="founder-image" />
    <h3 className="founder-name">{name}</h3>
    <p className="founder-role">{role}</p>
    <p className="founder-bio">{bio}</p>
    <div className="social-links">
      <a href={linkedin} aria-label="LinkedIn"><FaLinkedin /></a>
      <a href={twitter} aria-label="Twitter"><FaTwitter /></a>
      <a href={github} aria-label="GitHub"><FaGithub /></a>
    </div>
  </article>
);

export default FounderCard;
