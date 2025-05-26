// components/Programs/Programs.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Programs.module.css';

const Programs = () => {
  const programs = {
    teen: {
      title: "Teen Programs (Ages 13-18)",
      price: "49.99",
      fullPrice: "299.99",
      courses: [
        'Python Programming Basics',
        'Web Development Fundamentals',
        'Digital Literacy Essentials',
        'College Preparation Guide',
        'Financial Literacy for Teens'
      ],
      features: [
        'Interactive coding projects',
        'College application guidance',
        'Peer collaboration features',
        'Progress tracking dashboard'
      ],
      badge: "Most Popular 🔥"
    },
    adult: {
      title: "Adult Programs",
      price: "79.99",
      fullPrice: "499.99",
      courses: [
        'Advanced Python Applications',
        'Professional Digital Skills',
        'Personal Finance Management',
        'Career Development Strategies',
        'Parenting in Digital Age'
      ],
      features: [
        'Flexible learning schedule',
        'Real-world projects',
        'Parenting in tech workshops',
        'Career advancement resources'
      ],
      badge: "Professional Certification 🎓"
    }
  };

  return (
    <section className={styles.programsSection}>
      <div className={styles.sectionHeader}>
        <h2>Transform Your Digital Future</h2>
        <p className={styles.sectionSubtitle}>Choose your learning path</p>
      </div>

      <div className={styles.programsGrid}>
        {Object.entries(programs).map(([key, program]) => (
          <div key={key} className={styles.programCard}>
            {program.badge && (
              <div className={styles.programBadge}>
                {program.badge}
              </div>
            )}
            
            <div className={styles.cardHeader}>
              <h3>{program.title}</h3>
              <div className={styles.pricing}>
                <div className={styles.priceMain}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>{program.price}</span>
                  <span className={styles.duration}>/month</span>
                </div>
                <p className={styles.fullCourse}>
                  or ${program.fullPrice} full course
                </p>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.courseList}>
                <h4>Included Courses:</h4>
                <ul>
                  {program.courses.map((course, index) => (
                    <li key={index}>
                      <span className={styles.listMarker}>▹</span>
                      {course}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.programFeatures}>
                <h4>Program Features:</h4>
                <div className={styles.featuresGrid}>
                  {program.features.map((feature, index) => (
                    <div key={index} className={styles.featureItem}>
                      <div className={styles.featureIcon}>✓</div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <Link
                to={`/enroll/${key}`}
                className={styles.enrollButton}
                onClick={() => sessionStorage.setItem('programType', key)}
              >
                Start Learning Now
                <span className={styles.buttonPrice}>${program.price}/mo</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Programs;