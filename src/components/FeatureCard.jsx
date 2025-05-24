import './FeatureCard.css';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="feature-card">
      <div className="icon">{icon}</div>
      <h3 className="title">{title}</h3>
      <p className="description">{description}</p>
    </div>
  );
};

export default FeatureCard;