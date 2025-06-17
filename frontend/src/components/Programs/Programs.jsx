// src/components/Programs/Programs.jsx
import { Link } from 'react-router-dom';
import styles from './Programs.module.css';
import { usePrograms } from '../../context/ProgramsContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Programs = () => {
  const {
    programs,
    allCourses,
    loadingPrograms,
    programsError,
    refetchPrograms
  } = usePrograms();

  console.info('Programs data fetched from context:', programs);
  console.info('All courses data fetched from context:', allCourses);

  const getButtonContent = (programStatus, programPrice) => {
    switch (programStatus) {
      case 'available':
        return (
          <>
            Start Learning Now
            <span className={styles.buttonPrice}>${programPrice}/mo</span>
          </>
        );
      case 'inactive':
        return "Courses Coming Soon";
      case 'full':
        return "Program Full";
      case 'beta':
        return "Request Beta Access";
      default:
        return "Learn More";
    }
  };

  const isLinkActive = (programStatus) =>
    programStatus === 'available' || programStatus === 'beta';

  if (loadingPrograms) {
    return (
      <section className={styles.programsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainHeading}>Loading Our Offerings...</h2>
          <p className={styles.sectionSubtitle}>Please wait while we fetch our exciting programs and courses.</p>
        </div>
        <div className={styles.programsGrid} style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner message="Fetching programs and courses..." />
        </div>
      </section>
    );
  }

  if (programsError) {
    return (
      <section className={styles.programsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainHeading}>Error Loading Offerings</h2>
          <p className={styles.sectionSubtitle}>An issue occurred: {programsError}</p>
        </div>
        <div className={styles.programsGrid} style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <p>An issue occurred. Please try refreshing the page or contact support if the problem persists.</p>
          <button onClick={refetchPrograms} className={styles.retryButton}>
            Retry Loading Programs
          </button>
        </div>
      </section>
    );
  }

  if (programs.length === 0) {
    return (
      <section className={styles.programsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainHeading}>No Offerings Available</h2>
          <p className={styles.sectionSubtitle}>We couldn't find any programs or courses to display at the moment. Please check back soon!</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.programsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.mainHeading}>Transform Your Digital Future</h2>
        <p className={styles.sectionSubtitle}>Choose the learning path that's right for you at Zeelevate Academy.</p>
      </div>

      <div className={styles.programsGrid}>
        {programs.map((program) => {
          // --- CRITICAL CORRECTION HERE: Use program.programId for filtering ---
          const includedCourses = allCourses.filter(course =>
            course.programIds && Array.isArray(course.programIds) && course.programIds.includes(program.programId)
          );

          return (
            <div key={program.programId} className={styles.programCard}> {/* Also use program.programId for the key */}
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
                    {program.fullPrice ? `or $${program.fullPrice} for the full course` : ''}
                  </p>
                </div>
              </div>

              <div className={styles.cardBody}>
                {/* {program.shortDescription && <p className={styles.shortDescription}>{program.shortDescription}</p>} */}

                <div className={styles.courseList}>
                  <h4 className={styles.listHeading}>Included Courses:</h4>
                  <ul>
                    {includedCourses.length > 0 ? (
                      includedCourses.map((course) => (
                        <li key={course.courseId}>
                          <span className={styles.listMarker}>🔷</span>
                          {course.name}
                        </li>
                      ))
                    ) : (
                      <li className={styles.noCourseDetail}>No courses currently listed for this program.</li>
                    )}
                  </ul>
                </div>

                <div className={styles.programFeatures}>
                  <h4 className={styles.listHeading}>Program Features:</h4>
                  <div className={styles.featuresGrid}>
                    {program.features && program.features.length > 0 ? (
                      program.features.map((feature, index) => (
                        <div key={index} className={styles.featureItem}>
                          <div className={styles.featureIcon}>✓</div>
                          <span>{feature}</span>
                        </div>
                      ))
                    ) : (
                      <p className={styles.noFeatureDetail}>No specific features listed for this program.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                {isLinkActive(program.status) ? (
                  <Link
                    to={`/enroll/${program.programId}`} 
                    className={styles.enrollButton}
                    onClick={() => sessionStorage.setItem('programType', program.programId)}
                  >
                    {getButtonContent(program.status, program.price)}
                  </Link>
                ) : (
                  <button
                    className={`${styles.enrollButton} ${styles.disabledButton}`}
                    disabled
                  >
                    {getButtonContent(program.status, program.price)}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Programs;