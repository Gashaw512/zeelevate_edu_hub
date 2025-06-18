// src/components/Dashboard/CourseCard.jsx

import { memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'; // Import Link for internal navigation

import styles from './CourseCard.module.css'; // Your CSS module

/**
 * Renders a single course card with key information and a link to its detail page.
 */
const CourseCard = ({ course }) => {
    // Destructure all relevant properties from the course object
    const {
        id, // Used for React's key prop
        courseId, // The actual unique ID for the CourseDetail page route
        imageUrl,
        title,
        instructor,
        progress,
        status,
        difficulty, // Now using this property
        duration,   // Now using this property (assuming 'duration' is the correct one)
    } = course;

    // Ensure progress is a number for calculations and display
    const numericProgress = typeof progress === 'number' ? progress : parseInt(progress, 10) || 0;
    const progressWidth = `${numericProgress}%`;

    // Map status to a CSS class for styling
    const statusClass = (() => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return styles['status-completed'];
            case 'active':
            case 'in progress': // Your data currently uses 'active', but 'in progress' is common too
                return styles['status-in-progress'];
            default: // For 'Not Started' or any other status
                return styles['status-default'];
        }
    })();

    // Fallback image for courses without an imageUrl
    const fallbackImage = "https://placehold.co/300x200/cccccc/333333?text=Course";

    // Format difficulty (e.g., "advanced" -> "Advanced")
    const formattedDifficulty = difficulty ? (difficulty.charAt(0).toUpperCase() + difficulty.slice(1)) : 'N/A';

    return (
        <article className={styles['course-card']} aria-label={`Course: ${title}`}>
            <img
                src={imageUrl || fallbackImage}
                alt={`Thumbnail for ${title}`}
                className={styles['course-image']}
                onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop if fallback also fails
                    e.target.src = fallbackImage;
                }}
                loading="lazy" // Optimizes image loading
            />
            <div className={styles['card-content']}>
                <h3 className={styles['card-title']}>{title}</h3>
                {/* <p className={styles['card-instructor']}>Instructor: {instructor || 'Unknown'}</p> */}

                {/* Display Difficulty and Duration */}
                {/* Adding these directly as paragraphs or spans */}
                <p className={styles['meta-info']}>Difficulty: {formattedDifficulty}</p>
                <p className={styles['meta-info']}>Duration: {duration ? `${duration} minutes` : 'N/A'}</p>

                <div
                    className={styles['progress-bar']}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={numericProgress}
                    aria-label={`Course progress: ${numericProgress}%`}
                >
                    <div
                        className={styles['progress-fill']}
                        style={{ width: progressWidth }}
                    />
                </div>
                <p className={styles['progress-text']}>{numericProgress}% Progress</p>

                <span className={`${styles['status-badge']} ${statusClass}`} aria-label={`Course status: ${status}`}>
                    {status || 'Unknown'}
                </span>
            </div>

            <footer className={styles['card-footer']}>
                {/* Use React Router's Link for internal navigation to the CourseDetail page */}
                {/* We'll prioritize courseId, falling back to 'id' if courseId is somehow missing */}
<Link
    to={`/student/dashboard/courses/${courseId || id}`}
    className={styles['view-course-btn']}
    aria-label={`View details for ${title}`}
>
    View Course
</Link>
            </footer>
        </article>
    );
};

// Define PropTypes for strong type checking and documentation
CourseCard.propTypes = {
    course: PropTypes.shape({
        id: PropTypes.string.isRequired, // Unique ID for React key (from useEnrolledCoursesFetcher)
        courseId: PropTypes.string, // The actual ID for URL, potentially optional if `id` is primary route param
        imageUrl: PropTypes.string,
        title: PropTypes.string.isRequired,
        instructor: PropTypes.string, // Made optional as it might be 'Unknown Instructor'
        progress: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Can be string or number from source
        status: PropTypes.string,
        difficulty: PropTypes.string, // Ensure this matches your data
        duration: PropTypes.number,   // Ensure this matches your data (use 'classDuration' if needed)
    }).isRequired,
};

export default memo(CourseCard); // Export memoized component