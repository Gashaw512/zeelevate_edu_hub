import "./Courses.css";
import EnrollButton from "../EnrollButtons/EnrollButton";
import { Shield, Lock, Smartphone } from "react-feather"; // You'll need to install react-icons

const Courses = () => {
  const courses = [
    {
      id: 1,
      icon: <Shield size={40} />,
      title: "Cybersecurity Fundamentals",
      description: "Learn essential online safety practices, password management, and how to recognize common threats - no technical background required!",
      price: 99,
      duration: "4 weeks",
      prerequisites: "Basic computer skills",
      learningOutcomes: [
        "Protect personal devices",
        "Secure online accounts",
        "Identify phishing attempts"
      ]
    },
    {
      id: 2,
      icon: <Lock size={40} />,
      title: "Personal Digital Protection",
      description: "Secure your home network, social media accounts, and personal data from hackers and scammers",
      price: 149,
      duration: "6 weeks",
      prerequisites: "Internet access",
      learningOutcomes: [
        "Wi-Fi security setup",
        "Social media safety",
        "Data encryption basics"
      ]
    },
    {
      id: 3,
      icon: <Smartphone size={40} />,
      title: "Mobile Security Essentials",
      description: "Protect your smartphones and tablets from malware, insecure apps, and unauthorized access",
      price: 129,
      duration: "3 weeks",
      prerequisites: "Smartphone ownership",
      learningOutcomes: [
        "App permission management",
        "Safe mobile browsing",
        "Biometric security setup"
      ]
    }
  ];

  return (
    <section className="course-section" aria-labelledby="course-heading">
      <div className="course-container">
        <h1 id="course-heading" className="course-section__title">
          Start Your Cybersecurity Journey
        </h1>
        <p className="course-section__subtitle">
          Beginner-friendly courses designed for non-technical learners
        </p>

        <div className="course-grid">
          {courses.map((course) => (
            <article className="course-card" key={course.id}>
              <div className="course-card__icon">{course.icon}</div>
              <div className="course-card__content">
                <h2 className="course-card__title">{course.title}</h2>
                <p className="course-card__description">{course.description}</p>
                
                <div className="course-card__details">
                  <div className="course-card__learning">
                    <h3>You'll Learn To:</h3>
                    <ul>
                      {course.learningOutcomes.map((outcome, index) => (
                        <li key={index}>✓ {outcome}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="course-card__meta">
                    <div className="course-card__requirements">
                      <p><strong>Duration:</strong> {course.duration}</p>
                      <p><strong>Requirements:</strong> {course.prerequisites}</p>
                    </div>
                    
                    <div className="course-card__pricing">
                      <div className="course-card__price">
                        <span className="course-card__amount">${course.price}</span>
                        <span className="course-card__duration">one-time payment</span>
                      </div>
                      <EnrollButton 
                        course={course}
                        label={`Start ${course.title}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;