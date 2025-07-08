import { Link } from 'react-router-dom';
import styles from './Programs.module.css';
import { usePrograms } from '../../context/ProgramsContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Programs = () => {
  const { programs, allCourses, loadingPrograms, programsError, refetchPrograms } = usePrograms();

  // Calculates a rounded-up monthly price based on the total price over 3 months.
  // Using Math.round to get 166 from 499.99 / 3, aligning closely with client's "166".
  const calculateDisplayedMonthlyPrice = (totalPrice) => {
    if (typeof totalPrice !== 'number' || isNaN(totalPrice) || totalPrice <= 0) {
      return null; // Return null for invalid or zero prices
    }
    return Math.round(totalPrice / 3);
  };

  // Determines the content for the program's action button, including the monthly price badge.
  const getButtonContent = (status, actualProgramPrice) => {
    const monthlyPrice = calculateDisplayedMonthlyPrice(actualProgramPrice);
    const priceBadge = monthlyPrice !== null && (
      <span className={styles.buttonPrice}>${monthlyPrice}/mo</span>
    );

    switch (status) {
      case 'available':
        return <>Start Learning Now {priceBadge}</>;
      case 'beta':
        return <>Request Beta Access {priceBadge}</>;
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
          const includedCourses = allCourses.filter(
            c => Array.isArray(c.programIds) && c.programIds.includes(program.programId)
          );
          const activeLink = isLinkActive(program.status);

          // The 'price' from your data is the total cost (e.g., 499.99)
          const actualTotalProgramPrice = program.price;
          // Calculate the monthly price to be displayed (e.g., 166 or 167)
          const displayedMonthlyPrice = calculateDisplayedMonthlyPrice(actualTotalProgramPrice);

          return (
            <div key={program.programId} className={styles.programCard} role="region" aria-label={`Program: ${program.title}`}>
              {program.badge && <div className={styles.programBadge}>{program.badge}</div>}

              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{program.title}</h3>
                <div className={styles.pricing}>
                  <div className={styles.priceMain}>
                    <span className={styles.currency}>$</span>
                    {/* Display the calculated monthly price */}
                    <span className={styles.amount}>{displayedMonthlyPrice || 'N/A'}</span>
                    <span className={styles.duration}>/month</span>
                  </div>
                  {actualTotalProgramPrice && (
                    // Display the full payment amount clearly
                    <p className={styles.fullCourse}>Total Payment: ${actualTotalProgramPrice.toFixed(2)}</p>
                  )}
                </div>
              </div>

              <div className={styles.cardBody}>
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
                      {getButtonContent(program.status, actualTotalProgramPrice)}
                    </Link>
                  ) : (
                    <button className={`${styles.enrollButton} ${styles.disabledButton}`} disabled>
                      {getButtonContent(program.status, actualTotalProgramPrice)}
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