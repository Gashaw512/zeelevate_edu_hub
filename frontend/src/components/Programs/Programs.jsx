import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Programs.module.css';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError(null);

        // API Call to Backend
        // This endpoint has 'public' in its path, suggesting it should not require authentication.
        // If you still get a 401 Unauthorized error after this change, your backend
        // needs to be updated to make this specific route truly public (remove auth middleware).
        const response = await fetch(`${BACKEND_API_URL}/api/admin/public/courses`); 
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error format' }));
          throw new Error(errorData.message || `Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Raw Response Data:', data); // This will now show the object with 'success' and 'courses' keys

        // --- FIX: Access the 'courses' array from the response object ---
        // Your API response has the array of courses nested under the 'courses' key.
        const dataToMap = data.courses; 

        // --- Data Transformation: Map API Response (Course Data) to Program Card Structure ---
        // Note: The API response provides 'course' data, not 'program' data as your component expects.
        // Many 'program' fields (like badge, fullPrice, features, includedCourses as other programs)
        // are not available from this API and will be defaulted or omitted.
        const transformedPrograms = dataToMap.map(course => ({
          id: course.courseId || course._id, // Prefer courseId, fallback to _id
          title: course.courseTitle || course.title || 'Untitled Course',
          price: course.price || 0, 
          status: course.status || 'active', // Default to 'available' if not specified
          
          fullPrice: 0, // Not in API response for a single course
          badge: null,  // Not in API response
          
          courses: [course.courseTitle || 'N/A'], // Showing current course's title as included
          
          features: [], // Not in API response
          
          // status: 'available', 
        }));

        setPrograms(transformedPrograms);
      } catch (err) {
        console.error('Error fetching programs:', err);
        setError(`Failed to load programs: ${err.message}. Please check your network and server logs.`);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [BACKEND_API_URL]);

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
              <div className={styles.courseList}>
                <h4 className={styles.listHeading}>Included Courses:</h4>
                <ul>
                  {program.courses && program.courses.map((courseTitle, index) => (
                    <li key={index}>
                      <span className={styles.listMarker}>🔷</span>
                      {courseTitle}
                    </li>
                  ))}
                  {program.courses && program.courses.length === 0 && (
                    <li>No details available.</li>
                  )}
                </ul>
              </div>

              <div className={styles.programFeatures}>
                <h4 className={styles.listHeading}>Program Features:</h4>
                <div className={styles.featuresGrid}>
                  {program.features && program.features.map((feature, index) => (
                    <div key={index} className={styles.featureItem}>
                      <div className={styles.featureIcon}>✓</div>
                      <span>{feature}</span>
                    </div>
                  ))}
                  {program.features && program.features.length === 0 && (
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
        ))}
      </div>
    </section>
  );
};

export default Programs;