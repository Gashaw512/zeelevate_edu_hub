import { Link } from 'react-router-dom';
import styles from './Programs.module.css';
import { usePrograms } from '../../context/ProgramsContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Programs = () => {
  const { programs, allCourses, loadingPrograms, programsError, refetchPrograms } = usePrograms();

  // Calculates a monthly price based on the total price and duration in days,
  // using the exact formula: monthlyPrice = totalPrice / (durationDays / 30).
  // The result is rounded to two decimal places for currency display.
  const calculateMonthlyPrice = (totalPrice, durationDays) => {
    if (typeof totalPrice !== 'number' || isNaN(totalPrice) || totalPrice <= 0) {
      return null;
    }
    // Ensure durationDays is a valid number and positive.
    // If duration is 0 or less, or not a number, we can't calculate a meaningful monthly price.
    // Based on your previous instruction to fallback to 3 months if duration is not available.


    // Some adjustments to ensure we handle the case where durationDays is not provided or invalid.
    if (typeof durationDays !== 'number' || isNaN(durationDays) || durationDays <= 0) {
      // Fallback to 3 months if duration is not available or invalid.
      return (totalPrice / 3).toFixed(2);
    }

    const numberOfMonths = durationDays / 30; // Direct division as per your instruction
    // Ensure we don't divide by zero if numberOfMonths somehow becomes 0
    if (numberOfMonths === 0) {
      return null; // Cannot calculate monthly price if duration is effectively zero months
    }

    // Calculate price per month and format to two decimal places
    return (totalPrice / numberOfMonths).toFixed(2);
  };

  // Function to format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Determines the content for the program's action button, including the monthly price badge.
  const getButtonContent = (status, actualProgramPrice, durationDays) => {
    const monthlyPrice = calculateMonthlyPrice(actualProgramPrice, durationDays);
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

          const actualTotalProgramPrice = program.price;
          const formattedDeadline = formatDate(program.registrationDeadline);
          const displayedMonthlyPrice = calculateMonthlyPrice(actualTotalProgramPrice, program.duration);

          return (
            <div key={program.programId} className={styles.programCard} role="region" aria-label={`Program: ${program.title}`}>
              {program.badge && <div className={styles.programBadge}>{program.badge}</div>}

              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{program.title}</h3>
                <div className={styles.pricing}>
                  {displayedMonthlyPrice && ( // Only show monthly if it's calculable
                    <div className={styles.monthlyPriceDisplay}>
                      <span className={styles.currency}>$</span>
                      <span className={styles.amount}>{displayedMonthlyPrice}</span>
                      <span className={styles.duration}>/month</span>
                    </div>
                  )}
                  {actualTotalProgramPrice && (
                    <p className={styles.fullPaymentDisplay}>
                      <span className={styles.fullPaymentLabel}>Full Payment:</span> ${actualTotalProgramPrice.toFixed(2)}
                    </p>
                  )}
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
                          sessionStorage.setItem('programType', program.programId);
                          sessionStorage.setItem('programFullPrice', actualTotalProgramPrice);
                        }}
                      >
                        {getButtonContent(program.status, actualTotalProgramPrice, program.duration)}
                      </Link>
                    ) : (
                      <button className={`${styles.enrollButton} ${styles.disabledButton}`} disabled>
                        {getButtonContent(program.status, actualTotalProgramPrice, program.duration)}
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