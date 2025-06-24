import { Link } from 'react-router-dom';
import styles from './Programs.module.css';
import { usePrograms } from '../../context/ProgramsContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Programs = () => {
  const { programs, allCourses, loadingPrograms, programsError, refetchPrograms } = usePrograms();

  const getButtonContent = (status, price) => {
    const priceBadge = <span className={styles.buttonPrice}>${price}/mo</span>;
    switch (status) {
      case 'available': return <>Start Learning Now{priceBadge}</>;
      case 'beta': return <>Request Beta Access{priceBadge}</>;
      case 'inactive': return "Coming Soon";
      case 'full': return "Program Full";
      default: return "Learn More";
    }
  };

  const isLinkActive = status => ['available', 'beta'].includes(status);

  if (loadingPrograms) {
    return (
      <section className={styles.programsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainHeading}>Loading Programs...</h2>
          <p className={styles.sectionSubtitle}>Hang tight while we load our courses.</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner message="Fetching programs..." />
        </div>
      </section>
    );
  }

  if (programsError) {
    return (
      <section className={styles.programsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainHeading}>Error Loading Programs</h2>
          <p className={styles.sectionSubtitle}>{programsError}</p>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <button onClick={refetchPrograms} className={styles.retryButton}>Retry</button>
        </div>
      </section>
    );
  }

  if (!programs.length) {
    return (
      <section className={styles.programsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.mainHeading}>No Programs Available</h2>
          <p className={styles.sectionSubtitle}>Check back later for new offerings!</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.programsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.mainHeading}>Transform Your Digital Future</h2>
        <p className={styles.sectionSubtitle}>Find the learning path that's right for you.</p>
      </div>

      <div className={styles.programsGrid}>
        {programs.map(program => {
          const included = allCourses.filter(c => Array.isArray(c.programIds) && c.programIds.includes(program.programId));
          const active = isLinkActive(program.status);

          return (
            <div key={program.programId} className={styles.programCard} role="region" aria-label={program.title}>
              {program.badge && <div className={styles.programBadge}>{program.badge}</div>}

              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{program.title}</h3>
                <div className={styles.pricing}>
                  <div className={styles.priceMain}>
                    <span className={styles.currency}>$</span>
                    <span className={styles.amount}>{program.price}</span>
                    <span className={styles.duration}>/month</span>
                  </div>
                  {program.fullPrice && <p className={styles.fullCourse}>or ${program.fullPrice} full access</p>}
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.courseList}>
                  <h4 className={styles.listHeading}>Included Courses:</h4>
                  <ul>
                    { included.length
                      ? included.map(c => <li key={c.courseId}><span className={styles.listMarker}>🔷</span>{c.name}</li>)
                      : <li className={styles.noCourseDetail}>No courses listed.</li>
                    }
                  </ul>
                </div>

                <div className={styles.programFeatures}>
                  <h4 className={styles.listHeading}>Features:</h4>
                  <div className={styles.featuresGrid}>
                    { program.features?.length
                      ? program.features.map((f,i) => (
                          <div key={i} className={styles.featureItem}>
                            <div className={styles.featureIcon}>✓</div>{f}
                          </div>
                        ))
                      : <p className={styles.noFeatureDetail}>No features listed.</p>
                    }
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                { active
                  ? <Link to={`/enroll/${program.programId}`} className={styles.enrollButton} onClick={() => sessionStorage.setItem('programType', program.programId)}>
                      {getButtonContent(program.status, program.price)}
                    </Link>
                  : <button className={`${styles.enrollButton} ${styles.disabledButton}`} disabled>
                      {getButtonContent(program.status, program.price)}
                    </button>
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
