import { Link } from 'react-router-dom';
import styles from './Programs.module.css';
import DUMMY_PROGRAM_DATA from '../../data/program'

const Programs = () => {
  
  const programs = DUMMY_PROGRAM_DATA;

  const getButtonContent = (programStatus, programPrice) => {
    switch (programStatus) {
      case 'available':
        return (
          <>
            Start Learning Now
            <span className={styles.buttonPrice}>${programPrice}/mo</span>
          </>
        );
      case 'unavailable':
        return "Courses Coming Soon";
      case 'full':
        return "Program Full";
      case 'beta': // Example of another status
        return "Join Beta Waitlist";
      default:
        return "Learn More";
    }
  };

  const isLinkActive = (programStatus) => programStatus === 'available' || programStatus === 'beta'; // Allow beta to be clickable

  return (
    <section className={styles.programsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.mainHeading}>Transform Your Digital Future</h2>
        <p className={styles.sectionSubtitle}>Choose the learning path that's right for you at Zeelevate Academy.</p>
      </div>

      <div className={styles.programsGrid}>
        {/* Map over the DUMMY_PROGRAM_DATA array */}
        {programs.map((program) => (
          <div key={program.id} className={styles.programCard}> {/* Use program.id from dummy data */}
            {program.badge && (
              <div className={styles.programBadge}>
                {program.badge}
              </div>
            )}
            
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{program.title}</h3>
              <div className={styles.pricing}>
                <div className={styles.priceMain}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>{program.price}</span>
                  <span className={styles.duration}>/month</span>
                </div>
                <p className={styles.fullCourse}>
                  or ${program.fullPrice} for the full course
                </p>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.courseList}>
                <h4 className={styles.listHeading}>Included Courses:</h4>
                <ul>
                  {program.courses.map((course, index) => (
                    <li key={index}>
                      <span className={styles.listMarker}>🔷</span>
                      {course}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.programFeatures}>
                <h4 className={styles.listHeading}>Program Features:</h4>
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
              {isLinkActive(program.status) ? (
                <Link
                  to={`/enroll/${program.id}`} // Use program.id for the route
                  className={styles.enrollButton}
                  onClick={() => sessionStorage.setItem('programType', program.id)} // Store program.id
                >
                  {getButtonContent(program.status, program.price)}
                </Link>
              ) : (
                // Use a button element when not active for proper semantics
                <button
                  className={`${styles.enrollButton} ${styles.disabledButton}`}
                  disabled
                >
                  {getButtonContent(program.status, program.price)}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Programs;
