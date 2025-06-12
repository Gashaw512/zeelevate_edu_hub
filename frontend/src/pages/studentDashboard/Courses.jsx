// src/pages/Courses/Courses.jsx
import { memo } from 'react';
import PropTypes from 'prop-types';
// import { useAuth } from '../../context/AuthContext'; // Not needed if useEnrolledCourses provides all data
import { useEnrolledCourses } from '../../context/EnrolledCoursesContext'; // New import for the context hook

import styles from './Courses.module.css';
import CourseCard from '../../components/Dashboard/CourseCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Memoized Course List for performance optimization
const CourseList = memo(({ courses, loading, error }) => {
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
CourseList.displayName = "CourseList";

CourseList.propTypes = {
    courses: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string,
};

const Courses = () => {
    // --- Get enrolled courses data from the context ---
    const {
        enrolledCourses,
        loadingEnrolledCourses, // Use the renamed prop from context
        enrolledCoursesError,   // Use the renamed prop from context
        // refetchEnrolledCourses // Can be used if you need to manually re-fetch from here
    } = useEnrolledCourses();

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>My Enrolled Courses</h2>
            {/* Pass the loading and error states from the context to CourseList */}
            <CourseList
                courses={enrolledCourses}
                loading={loadingEnrolledCourses} // Use loading from context
                error={enrolledCoursesError}     // Use error from context
            />
        </div>
    );
};

export default Courses;