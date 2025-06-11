// Dashboard 'My Courses' page.
import { memo, useEffect, useState, useCallback, useRef } from 'react'; // Added useRef
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';

import styles from './Courses.module.css';
import CourseCard from '../../components/Dashboard/CourseCard';
import LoadingSpinner from '../../components/common/LoadingSpinner'; // Assuming this is a proper component

// Memoized Course List for performance optimization
const CourseList = memo(({ courses, loading, error }) => {
  console.log("CourseList rendered. Loading:", loading, "Error:", error, "Courses count:", courses ? courses.length : 0);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner message="Loading your courses..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorMessageContainer}>
        <p className={styles.errorMessage}>Error loading courses: {error}</p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className={styles.noCoursesContainer}>
        <p className={styles.noCoursesMessage}>No enrolled courses found. Time to explore some new programs!</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
});

CourseList.propTypes = {
  courses: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

const Courses = () => {
  const { user, loading: authLoading } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  // --- DEBUG LOG: Component Renders ---
  const renderCount = useRef(0);
  renderCount.current = renderCount.current + 1;
  console.log(`%cCourses Component Rendered (Count: ${renderCount.current})`, 'color: purple; font-weight: bold;');


  // Memoize the fetch function using useCallback
  const fetchEnrolledCourses = useCallback(async () => {
    // --- DEBUG LOG: Inside fetchEnrolledCourses function call ---
    console.log("-----------------------------------------");
    console.log(`%cfetchEnrolledCourses function EXECUTED.`, 'color: green; font-weight: bold;');
    console.log("  - Current authLoading:", authLoading);
    console.log("  - Current user UID:", user ? user.uid : "NULL/UNDEFINED");
    console.log("-----------------------------------------");

    // This is the CRITICAL GATEKEEPER for fetching data
    if (authLoading || !user || !user.uid) {
      console.warn("  Auth not ready or user not logged in/UID missing. Keeping coursesLoading TRUE. Waiting...");
      setCoursesLoading(true); // Ensure loading is true while waiting for auth
      setCoursesError(null);   // Clear any previous errors while waiting
      return; // IMPORTANT: Exit here if auth is not ready
    }

    console.log("  Auth is ready. Starting course fetch...");
    setCoursesLoading(true); // Set loading to true as we start the API call
    setCoursesError(null);   // Clear any previous errors

    try {
      console.log(`  Attempting to fetch enrollments for UID: ${user.uid} from: ${API_BASE_URL}/api/users/get-enrollments/`);

      const response = await fetch(`${API_BASE_URL}/api/users/get-enrollments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${await user.getIdToken()}` // Uncomment if needed
        },
        body: JSON.stringify({ uid: user.uid }),
      });

      console.log("  Fetch response received. Status:", response.status, "StatusText:", response.statusText);

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (jsonErr) {
          console.error("  Failed to parse error JSON:", jsonErr);
          errorData.message = `Server responded with status ${response.status} but no JSON error message.`;
        }
        console.error("  API Error Response:", errorData);
        throw new Error(errorData.message || `Failed to fetch enrollments: Server error ${response.status}`);
      }

      const data = await response.json();
      const enrollments = data.enrollments || [];
      console.log("  Successfully fetched enrollments data:", enrollments);

      const transformedCourses = enrollments.map(enrollment => ({
        id: enrollment.id,
        title: enrollment.course_title || 'Untitled Course',
        instructor: enrollment.instructor_name || 'N/A',
        progress: enrollment.progress || 0,
        status: enrollment.status || 'Not Started',
        teachableLink: enrollment.classLink || '#',
        imageUrl: enrollment.course_image_url || null,
      }));

      setEnrolledCourses(transformedCourses);
      console.log("  Enrolled courses state updated successfully.");

    } catch (err) {
      console.error("  Error encountered during course fetch:", err.message);
      setCoursesError(err.message || "Failed to load courses. Please try again.");
    } finally {
      console.log("  Fetch process finished. Setting coursesLoading to FALSE.");
      setCoursesLoading(false); // ALWAYS set loading to false here
    }
  }, [user, authLoading, API_BASE_URL]); // Dependencies for useCallback


  // --- DEBUG LOG: useEffect lifecycle and dependency changes ---
  const prevFetchEnrolledCoursesRef = useRef();
  useEffect(() => {
    console.log(`%cCourses useEffect triggered.`, 'color: blue; font-weight: bold;');
    if (prevFetchEnrolledCoursesRef.current !== fetchEnrolledCourses) {
        console.warn(`%c  'fetchEnrolledCourses' function reference CHANGED!`, 'color: orange; font-weight: bold;');
    } else {
        console.info(`  'fetchEnrolledCourses' function reference is STABLE.`);
    }
    prevFetchEnrolledCoursesRef.current = fetchEnrolledCourses;


    fetchEnrolledCourses(); // Call the memoized fetch function

    return () => {
      console.log(`%cCourses useEffect CLEANUP.`, 'color: red; font-weight: bold;');
      // This cleanup runs when dependencies change or component unmounts.
      // If you see this log *without* an immediate re-mount, the component is unmounting.
    };
  }, [fetchEnrolledCourses]); // Dependency for useEffect is the fetch function itself


  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Enrolled Courses</h2>
      <CourseList courses={enrolledCourses} loading={coursesLoading} error={coursesError} />
    </div>
  );
};

export default Courses;