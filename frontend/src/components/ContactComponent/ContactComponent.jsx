// src/components/ContactComponent/ContactComponent.jsx
import "./ContactComponent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faMapMarkerAlt, faEnvelope } from "@fortawesome/free-solid-svg-icons"; // Using faMapMarkerAlt for home icon

const ContactComponent = () => {
  return (
    <section className="contact-section"> {/* Changed class for consistency */}
      <div className="contact-container">
        <h1 className="contact-title">Get in Touch with Zeelevate Academy</h1>
        <p className="contact-description">
          Have questions about our courses, partnerships, or anything else? We're here to help!
          Fill out the form below or reach out to us using the contact details provided.
        </p>

// In any component
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Tailwind Test - This should be blue with white text
</div>
        <div className="contact-row"> {/* Changed class for consistency */}
          <div className="contact-info-col"> {/* Changed class for clarity */}
            <div className="info-item">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon" /> {/* Using faMapMarkerAlt */}
              <span>
                <h5>Minnesota</h5>
              </span>
            </div>

            <div className="info-item">
              <FontAwesomeIcon icon={faPhone} className="contact-icon" />
              <span>
                <h5>(651) 468-7345</h5> {/* Formatted phone number */}
                {/* <p>Monday to Saturday, 10 AM to 6 PM EAT</p>  */}
              </span>
            </div>

            <div className="info-item">
              <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
              <span>
                <h5>tech@zeelevate.com</h5> {/* Changed email to be specific to Zeelevate */}
                <p>Send us your query anytime!</p> {/* More inviting text */}
              </span>
            </div>
          </div>

          <div className="contact-form-col"> {/* Changed class for clarity */}
            <form action="#" method="POST" className="contact-form"> {/* Added method and action (for potential backend) */}
              <input type="text" placeholder="Your Full Name" required className="form-input" />
              <input type="email" placeholder="Your Email Address" required className="form-input" />
              <input type="text" placeholder="Subject of Your Message" required className="form-input" />
              <textarea rows="6" placeholder="Write your message here..." required className="form-textarea"></textarea> {/* Adjusted rows, placeholder */}
              <button type="submit" className="cta-button primary-cta-button"> {/* Reusing primary CTA button style */}
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactComponent;