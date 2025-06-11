import { Link } from 'react-router-dom';
import styles from './Programs.module.css';
import useProgramsFetcher from '../../hooks/useProgramsFetcher'; // Corrected path if needed

const Programs = () => {
  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL;
  const { programs, loading, error } = useProgramsFetcher(BACKEND_API_URL);

  const getButtonContent = (programStatus, programPrice) => {
    switch (programStatus) {
      case 'active':
        return (
          <>
            Start Learning Now
            <span className={styles.buttonPrice}>${programPrice}/mo</span>
          </>
        );
      case 'inactive':
        return "Courses Coming Soon";
      default:
        return "Learn More";
    }
  };

  const isLinkActive = (programStatus) => programStatus === 'active' || programStatus === 'beta';

  if (loading) {
    return (
      <section className={styles.programsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainHeading}>Loading Our Offerings...</h2>
          <p className={styles.sectionSubtitle}>Please wait while we fetch our exciting courses.</p>
        </div>
        <div className={styles.programsGrid} style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.programsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainHeading}>Error Loading Offerings</h2>
          <p className={styles.sectionSubtitle}>{error}</p>
        </div>
        <div className={styles.programsGrid} style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <p>An issue occurred. Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      </section>
    );
  }

  if (programs.length === 0) {
    return (
      <section className={styles.programsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainHeading}>No Offerings Available</h2>
          <p className={styles.sectionSubtitle}>We couldn't find any programs or courses to display at the moment.</p>
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
        {programs.map((program) => (
          <div key={program.id} className={styles.programCard}>
            {program.badge && (
              <div className={styles.programBadge}>
                {program.badge}
              </div>
            )}

            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{program.name}</h3> {/* Changed from program.title to program.name */}
              <div className={styles.pricing}>
                <div className={styles.priceMain}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>{program.fixedPrice}</span> {/* Changed from program.price to program.fixedPrice */}
                  <span className={styles.duration}>/month</span>
                </div>
                <p className={styles.fullCourse}>
                  {program.fullPrice ? `or $${program.fullPrice} for the full course` : ''}
                </p>
              </div>
            </div>

            <div className={styles.cardBody}>
              <p className={styles.shortDescription}>{program.shortDescription}</p> {/* Added short description */}
              <div className={styles.courseList}>
                <h4 className={styles.listHeading}>Included Courses:</h4>
                <ul>
                  {program.courses && program.courses.length > 0 ? (
                    program.courses.map((course, index) => (
                      <li key={index}>
                        <span className={styles.listMarker}>🔷</span>
                        {course.name}
                      </li>
                    ))
                  ) : (
                    <li>No details available.</li>
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
                    <p style={{ fontSize: '0.9em', color: '#666', fontStyle: 'italic' }}>No specific features listed.</p>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              {isLinkActive(program.status) ? (
                <Link
                  to={`/enroll/${program.id}`}
                  className={styles.enrollButton}
                  onClick={() => sessionStorage.setItem('programType', program.id)}
                >
                  {getButtonContent(program.status, program.fixedPrice)}
                </Link>
              ) : (
                <button
                  className={`${styles.enrollButton} ${styles.disabledButton}`}
                  disabled
                >
                  {getButtonContent(program.status, program.fixedPrice)}
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