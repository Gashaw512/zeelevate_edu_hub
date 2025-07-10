import { Link } from 'react-router-dom';
import styles from './Programs.module.css';
import { usePrograms } from '../../context/ProgramsContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Programs = () => {
  const { programs, allCourses, loadingPrograms, programsError, refetchPrograms } = usePrograms();

  // Function to format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Determines the content for the program's action button.
  const getButtonContent = (status) => {
    switch (status) {
      case 'available':
        return "Start Learning Now";
      case 'beta':
        return "Request Beta Access";
      case 'inactive':
        return "Coming Soon";
      case 'full':
        return "Program Full";
      default:
        return "Learn More";
    }
  };

  // Determines if the program's button should be an active link.
  const isLinkActive = (status) => ['available', 'beta'].includes(status);

  // --- Loading, Error, and No Programs States ---
  if (loadingPrograms) {
    return (
      <section className={styles.programsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainHeading}>Loading Programs...</h2>
          <p className={styles.sectionSubtitle}>Fetching our exciting learning paths for you.</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner message="Please wait..." />
        </div>
      </section>
    );
  }

  if (programsError) {
    return (
      <section className={styles.programsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainHeading}>Failed to Load Programs</h2>
          <p className={styles.sectionSubtitle}>We're sorry, an error occurred. Please try again.</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-error)' }}>
          <button onClick={refetchPrograms} className={styles.retryButton}>Retry Loading Programs</button>
        </div>
      </section>
    );
  }

  if (!programs.length) {
    return (
      <section className={styles.programsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainHeading}>No Programs Available</h2>
          <p className={styles.sectionSubtitle}>It looks like we don't have any programs listed right now. Please check back soon!</p>
        </div>
      </section>
    );
  }

  // --- Main Programs Grid Display ---
  return (
    <section className={styles.programsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.mainHeading}>Transform Your Digital Future</h2>
        <p className={styles.sectionSubtitle}>Find the learning path that's right for you.</p>
      </div>

      <div className={styles.programsGrid}>
        {programs.map(program => {
          // Filter courses included in this specific program
          console.log(program)
          const includedCourses = allCourses.filter(
            c => Array.isArray(c.programIds) && c.programIds.includes(program.programId)
          );
          const activeLink = isLinkActive(program.status);

          // The 'price' from your data is the total cost (e.g., 499.99)
          const actualTotalProgramPrice = program.price;
          const formattedDeadline = formatDate(program.registrationDeadline);

          return (
            <div key={program.programId} className={styles.programCard} role="region" aria-label={`Program: ${program.title}`}>
              {program.badge && <div className={styles.programBadge}>{program.badge}</div>}

              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{program.title}</h3>
                <div className={styles.pricing}>
                  <div className={styles.priceMain}>
                    <span className={styles.currency}>$</span>
                    {/* Display the total program price directly without "Total" */}
                    <span className={styles.amount}>{actualTotalProgramPrice ? actualTotalProgramPrice.toFixed(2) : 'N/A'}</span>
                    {/* Removed <span className={styles.duration}> Total</span> */}
                  </div>
                </div>
              </div>

              <div className={styles.cardBody}>
                {formattedDeadline && (
                  <p className={styles.registrationDeadline}>
                    <span className={styles.deadlineLabel}>Registration Deadline:</span> {formattedDeadline}
                  </p>
                )}
                <div className={styles.courseList}>
                  <h4 className={styles.listHeading}>Included Courses:</h4>
                  <ul>
                    {includedCourses.length > 0
                      ? includedCourses.map(c => (
                          <li key={c.courseId}>
                            <span className={styles.listMarker}>🔷</span>{c.name}
                          </li>
                        ))
                      : <li className={styles.noCourseDetail}>No courses listed for this program.</li>
                    }
                  </ul>
                </div>

                <div className={styles.programFeatures}>
                  <h4 className={styles.listHeading}>Features:</h4>
                  <div className={styles.featuresGrid}>
                    {program.features?.length > 0
                      ? program.features.map((f, i) => (
                          <div key={i} className={styles.featureItem}>
                            <div className={styles.featureIcon}>✓</div>{f}
                          </div>
                        ))
                      : <p className={styles.noFeatureDetail}>No features listed for this program.</p>
                    }
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                {activeLink
                  ? (
                      <Link
                        to={`/enroll/${program.programId}`}
                        className={styles.enrollButton}
                        onClick={() => {
                          // Store the program ID and the actual TOTAL price for enrollment
                          sessionStorage.setItem('programType', program.programId);
                          sessionStorage.setItem('programFullPrice', actualTotalProgramPrice);
                        }}
                      >
                        {getButtonContent(program.status)}
                      </Link>
                    ) : (
                      <button className={`${styles.enrollButton} ${styles.disabledButton}`} disabled>
                        {getButtonContent(program.status)}
                      </button>
                    )
                }
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Programs;