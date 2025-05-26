import "./Testimonials.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
const user1 = "/images/user1.jpg";
const user2 = "/images/user2.jpg";

const Testimonials = () => {
  return (
    <section className="zeelevate-testimonials">
      <div className="testimonials-header">
        <h2>Student Success Stories</h2>
        <p>Hear from our learners about their Zeelevate journey</p>
      </div>
      
      <div className="testimonials-grid">
        <div className="testimonial-card">
          <img src={user1} alt="Python student" />
          <div className="testimonial-content">
            <p className="quote">
              "Zeelevate's Python course transformed how I approach problem-solving. 
              The practical projects helped me land my first tech internship!"
            </p>
            <div className="student-info">
              <h3>Sarah Johnson</h3>
              <p className="course-tag">Python Programming Student</p>
              <div className="rating">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className="star"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="testimonial-card">
          <img src={user2} alt="Finance student" />
          <div className="testimonial-content">
            <p className="quote">
              "The financial literacy program gave me confidence to manage my 
              college expenses and even start investing small amounts."
            </p>
            <div className="student-info">
              <h3>Michael Chen</h3>
              <p className="course-tag">Financial Literacy Student</p>
              <div className="rating">
                {[...Array(4)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className="star"
                  />
                ))}
                <FontAwesomeIcon icon={faStar} className="star empty" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;