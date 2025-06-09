// Dashboard 'My Courses' page.
import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext'; // Assuming you have an AuthContext for user UID

import styles from './Courses.module.css';
import CourseCard from '../../components/Dashboard/CourseCard';

// Memoized Course List for performance optimization
const CourseList = memo(({ courses, loading, error }) => {
  if (loading) {
    return <p className={styles.loadingMessage}>Loading your courses...</p>;
  }

  if (error) {
    return <p className={styles.errorMessage}>Error loading courses: {error}</p>;
  }

  if (!courses || courses.length === 0) {
    return <p className={styles.noCoursesMessage}>No enrolled courses found. Time to explore some new programs!</p>;
  }

  return (
    <div className={styles.grid}>
      {courses.map(course => (
        // Ensure that each 'course' object passed here matches CourseCard's PropTypes
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
  // Assuming useAuth provides a 'user' object with a 'uid' property
  // and a 'loading' state to indicate if auth is still in progress.
  const { user, loading: authLoading } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  // Define your backend API base URL using environment variable
  // Make sure VITE_BACKEND_URL is correctly set in your .env file (e.g., VITE_BACKEND_URL=http://localhost:3001)
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      // Don't fetch until user is authenticated and auth loading is complete
      if (authLoading || !user || !user.uid) {
        // console.log("Waiting for user authentication or UID:", { authLoading, user });
        setCoursesLoading(true); // Keep loading state true while auth is in progress
        setCoursesError(null); // Clear any previous errors while waiting
        return;
      }

      setCoursesLoading(true);
      setCoursesError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/get-enrollments/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // If your backend requires a Firebase ID token for authentication,
            // you would get it here and send it in the Authorization header:
            // 'Authorization': `Bearer ${await user.getIdToken()}`
            // The provided backend screenshot for get-enrollments doesn't show auth headers
            // but it requires a 'uid' in the body.
          },
          body: JSON.stringify({ uid: user.uid }), // Send the Firebase UID to your backend
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error format' }));
          throw new Error(errorData.message || `Failed to fetch enrollments: Server responded with status ${response.status}`);
        }

        const data = await response.json();
        const enrollments = data.enrollments || []; // Access the 'enrollments' array from the backend response

        // Transform backend data to match CourseCard's expected props
        const transformedCourses = enrollments.map(enrollment => ({
          id: enrollment.id, // Use the enrollment ID as the unique key
          // Assuming course_id is what you need for some internal logic, but not directly for CourseCard props
          // course_id: enrollment.course_id, 
          
          // Map backend fields to CourseCard props:
          title: enrollment.course_title || 'Untitled Course',
          instructor: 'N/A', // Your backend response doesn't provide instructor name. You might need to add this or use a placeholder.
          
          // Progress and Status are not directly in your backend enrollment data.
          // You will need to determine how to derive these:
          // For now, using placeholders. You should implement actual logic for these.
          progress: 0, // Placeholder: You'll need logic to calculate actual progress (e.g., from user interaction, or another API)
          status: 'Not Started', // Placeholder: You'll need logic to determine status (e.g., 'In Progress', 'Completed')
          
          teachableLink: enrollment.classLink || '#', // Map 'classLink' to 'teachableLink'
          imageUrl: null, // Your backend response doesn't provide image URL for enrolled courses. Use CourseCard's fallback.
        }));

        setEnrolledCourses(transformedCourses);

      } catch (err) {
        console.error("Error fetching enrolled courses:", err);
        setCoursesError(err.message || "Failed to load courses. Please try again.");
      } finally {
        setCoursesLoading(false);
      }
    };

    // Trigger fetch when user or authLoading state changes
    fetchEnrolledCourses();

  }, [user, authLoading, API_BASE_URL]); // Dependencies: re-run when user, authLoading, or API_BASE_URL changes

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Enrolled Courses</h2>
      <CourseList courses={enrolledCourses} loading={coursesLoading} error={coursesError} />
    </div>
  );
};

export default Courses;