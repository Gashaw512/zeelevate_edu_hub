import { memo, useMemo } from 'react'; // Added useMemo for potential filtering/sorting
import PropTypes from 'prop-types';
import { useEnrolledCourses } from '../../context/EnrolledCoursesContext'; // Assumes your context is set up
import { Link } from 'react-router-dom'; // For linking to explore programs

import styles from './Courses.module.css'; // Your CSS module
import CourseCard from '../../components/Dashboard/CourseCard'; // Your CourseCard component
import LoadingSpinner from '../../components/common/LoadingSpinner'; // Your LoadingSpinner
import { XCircle, Info } from 'lucide-react'; // Icons for error/no courses

/**
 * Renders a list of course cards, handling loading, error, and empty states.
 * This component is memoized for performance.
 */
const CourseList = memo(({ courses, isLoading, fetchError }) => {
    // Consolidated loading and error handling at the top
    if (isLoading) {
        return (
            <div className={styles.statusContainer}>
                <LoadingSpinner message="Fetching your enrolled courses..." />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className={styles.statusContainer}>
                <XCircle size={48} className={styles.errorIcon} />
                <p className={styles.statusMessage}>
                    **Error loading courses:** {fetchError}. Please try again later.
                </p>
            </div>
        );
    }

    if (!courses || courses.length === 0) {
        return (
            <div className={styles.statusContainer}>
                <Info size={48} className={styles.infoIcon} />
                <p className={styles.statusMessage}>
                    No enrolled courses found. Time to <Link to="/programs" className={styles.exploreLink}>explore some new programs</Link>!
                </p>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {courses.map(course => (
                // Ensure CourseCard receives the actual course object,
                // and its 'key' prop is the unique 'id' from the enrolledCourses array.
                // The CourseCard itself should use course.courseId for its internal Link.
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
});

CourseList.displayName = "CourseList"; // Good practice for debugging

// Define PropTypes for validation and clarity
CourseList.propTypes = {
    courses: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired, // React key, could be composite
        courseId: PropTypes.string, // The actual backend ID, might be undefined for some
        title: PropTypes.string.isRequired,
        imageUrl: PropTypes.string,
        instructor: PropTypes.string,
        progress: PropTypes.number,
        status: PropTypes.string,
        teachableLink: PropTypes.string,
        difficulty: PropTypes.string,
        duration: PropTypes.number, // Ensure this matches your useEnrolledCoursesFetcher
        // Add other expected course properties here for robust validation
    })).isRequired,
    isLoading: PropTypes.bool.isRequired,
    fetchError: PropTypes.string, // Error message is a string, can be null/undefined
};

/**
 * Main Courses page component for the student dashboard.
 * Fetches enrolled courses from context and renders them using CourseList.
 */
const Courses = () => {
    // Destructure properties from the enrolled courses context
    const {
        enrolledCourses,
        loadingEnrolledCourses,
        enrolledCoursesError,
        // If you need to trigger a refetch from this page, add refetchEnrolledCourses here
    } = useEnrolledCourses();

    // Use useMemo for any filtering/sorting if needed in the future
    // For now, we're just passing enrolledCourses directly
    const displayedCourses = useMemo(() => {
        // You could add filtering (e.g., active, completed) here based on query params
        return enrolledCourses;
    }, [enrolledCourses]);


    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>My Enrolled Courses</h1>

            <CourseList
                courses={displayedCourses}
                isLoading={loadingEnrolledCourses}
                fetchError={enrolledCoursesError}
            />
        </div>
    );
};

export default Courses;