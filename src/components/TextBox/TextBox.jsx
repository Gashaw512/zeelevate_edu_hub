import { Link } from "react-router-dom";
import "./TextBox.css";

const TextBox = () => {
  return (
    <div className="text-box">
      <h1>Empowering Digital Futures</h1>
      <p>
        Master essential 21st century skills with our comprehensive programs in:<br />
      </p>

      <div className="program-list">
        <ul>
          <li>Python programming</li>
          <li>Financial literacy</li>
          <li>Digital citizenship</li>
          <li>College preparation</li>
        </ul>
      </div>
      <Link to="/about" className="cta-btn">
        Explore Our Programs
      </Link>
    </div>
  );
};

export default TextBox;