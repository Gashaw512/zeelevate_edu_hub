
import  {  useMemo } from 'react'; 
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useEnrolledCourses } from '../../context/EnrolledCoursesContext'; 
import styles from './CourseDetail.module.css'; 

const CourseDetail = () => {
  const { courseId } = useParams(); 
  const {
    enrolledCourses,
    loadingEnrolledCourses,
    enrolledCoursesError,
    refetchEnrolledCourses 
  } = useEnrolledCourses(); 

  const course = useMemo(() => {
    if (enrolledCourses && Array.isArray(enrolledCourses) && courseId) {
   
      return enrolledCourses.find(c => c.courseId === courseId);
    }
    return null; 
  }, [enrolledCourses, courseId]);

  if (loadingEnrolledCourses) {
    return (
      <div className={styles.container}>
        <LoadingSpinner message="Loading course information..." />
      </div>
    );
  }

  if (enrolledCoursesError) {
    return (
      <div className={styles.container}>
        <h2 className={styles.errorText}>Error: {enrolledCoursesError.message || 'Failed to load courses.'}</h2>
        <p>There was an issue accessing your enrolled courses. Please try again.</p>
        <button onClick={refetchEnrolledCourses} className={styles.retryButton}>
            Retry Loading Courses
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.container}>
        <h2 className={styles.notFoundText}>Course Not Found</h2>
        <p>The course you are looking for (ID: **{courseId || 'N/A'}**) does not exist in your enrolled list.</p>
        <p>Please check the URL or return to your <Link to="/student/dashboard/courses">My Courses</Link> page.</p>
        {enrolledCourses.length === 0 && (
            <p>You currently have no courses enrolled. <Link to="/programs">Explore Programs</Link></p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.courseDetailContainer}>
      <h1 className={styles.courseTitle}>{course.title || course.name || 'Untitled Course'}</h1>
      <p className={styles.courseDescription}>{course.description || 'No detailed description available for this course.'}</p>

      <div className={styles.courseInfo}>
        <p><strong>Program:</strong> {course.programTitle || 'N/A'}</p>
        {/* <p><strong>Instructor:</strong> {course.instructor || 'Not specified'}</p> */}
        <p><strong>Difficulty:</strong> {course.difficulty ? (course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)) : 'N/A'}</p>
        <p><strong>Duration:</strong> {course.duration ? `${course.duration} minutes` : 'N/A'}</p>
        <p><strong>Your Progress:</strong> {typeof course.progress === 'number' ? `${course.progress}%` : 'N/A'}</p>
        <p><strong>Status:</strong> {course.status ? (course.status.charAt(0).toUpperCase() + course.status.slice(1)) : 'N/A'}</p>
        <p><strong>Enrolled On:</strong> {course.enrollmentDate ? new Date(course.enrollmentDate).toLocaleDateString() : 'N/A'}</p>
      </div>

      {course.imageUrl && (
        <div className={styles.courseImageWrapper}>
          <img src={course.imageUrl} alt={`Thumbnail for ${course.title || 'course'}`} className={styles.courseImage} />
        </div>
      )}

      {course.teachableLink ? (
        <a href={course.teachableLink} target="_blank" rel="noopener noreferrer" className={styles.teachableLinkButton}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap"><path d="M21.43 14.8V7.5L12 2 2.57 7.5v7.3L12 20l9.43-5.2Z"/><path d="m2.57 7.5 9.43 5.5 9.43-5.5"/><path d="M12 2v18"/><path d="M14.5 12.8 21.43 14.8"/><path d="M9.5 12.8 2.57 14.8"/></svg>
          Go to Teachable Course
        </a>
      ) : (
        <p className={styles.noTeachableLink}>No direct link to Teachable course content available at this time.</p>
      )}

      {/* Placeholder for more detailed content (e.g., modules, lessons, discussions) */}
      {/* If your 'courses' data from the enrollment hook contained an array of modules/lessons,
          you could render them here. For example:
          {course.modules && course.modules.length > 0 && (
            <div className={styles.courseContentSection}>
              <h2 className={styles.contentSectionTitle}>Course Curriculum</h2>
              <ul className={styles.moduleList}>
                {course.modules.map(module => (
                  <li key={module.id}>{module.title}</li>
                ))}
              </ul>
            </div>
          )}
      */}

      {/* Back to Courses button */}
      <div className={styles.backButtonWrapper}>
        <Link to="/student/dashboard/courses" className={styles.backButton}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
          Back to All My Courses
        </Link>
      </div>
    </div>
  );
};

export default CourseDetail;