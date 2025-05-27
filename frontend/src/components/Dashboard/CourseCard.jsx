import PropTypes from 'prop-types';
import styles from './CourseCard.module.css';

const CourseCard = ({ course }) => {
  const { imageUrl, title, instructor, progress, status } = course;

  // Ensure progress width is valid (e.g., "70%" or "70%")
  const progressWidth = typeof progress === 'string' ? progress : `${progress}%`;

  // Determine status class dynamically
  const statusClass =
    status === 'Completed'
      ? styles['status-completed']
      : status === 'In Progress'
      ? styles['status-in-progress']
      : styles['status-default'];

  // Fallback image URL
  const fallbackImage = "https://placehold.co/300x200/cccccc/333333?text=Course";

  return (
    <article className={styles['course-card']} aria-label={`Course: ${title}`}>
      <img
        src={imageUrl}
        alt={`Thumbnail for ${title}`}
        className={styles['course-image']}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = fallbackImage;
        }}
        loading="lazy"
      />
      <div className={styles['card-content']}>
        <h3 className={styles['card-title']}>{title}</h3>
        <p className={styles['card-instructor']}>Instructor: {instructor}</p>

        <div
          className={styles['progress-bar']}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={parseInt(progressWidth, 10) || 0}
          aria-label={`Course progress: ${progressWidth}`}
        >
          <div
            className={styles['progress-fill']}
            style={{ width: progressWidth }}
          />
        </div>
        <p className={styles['progress-text']}>{progressWidth} Progress</p>

        <span className={`${styles['status-badge']} ${statusClass}`} aria-label={`Course status: ${status}`}>
          {status}
        </span>
      </div>

      <footer className={styles['card-footer']}>
        <button
          className={styles['view-course-btn']}
          type="button"
          aria-label={`View details for ${title}`}
          onClick={() => {
            // Placeholder for view course click handler
            console.log(`Viewing course: ${title}`);
          }}
        >
          View Course
        </button>
      </footer>
    </article>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    imageUrl: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    instructor: PropTypes.string.isRequired,
    progress: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
};

export default CourseCard;
