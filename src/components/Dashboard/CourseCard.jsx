// src/components/CourseCard.jsx
import styles from './CourseCard.module.css';

const CourseCard = ({ course }) => (
  <div className={styles['course-card']}>
    <img
      src={course.imageUrl}
      alt={course.title}
      className={styles['course-image']}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "https://placehold.co/300x200/cccccc/333333?text=Course ";
      }}
    />
    <div className={styles['card-content']}>
      <h3 className={styles['card-title']}>{course.title}</h3>
      <p className={styles['card-instructor']}>Instructor: {course.instructor}</p>
      <div className={styles['progress-bar']}>
        <div
          className={styles['progress-fill']}
          style={{ width: course.progress }}
        ></div>
      </div>
      <p className={styles['progress-text']}>{course.progress} Progress</p>
      <span
        className={`${styles['status-badge']} ${
          course.status === 'Completed'
            ? styles['status-completed']
            : course.status === 'In Progress'
            ? styles['status-in-progress']
            : styles['status-default']
        }`}
      >
        {course.status}
      </span>
    </div>
    <div className={styles['card-footer']}>
      <button className={styles['view-course-btn']}>View Course</button>
    </div>
  </div>
);

export default CourseCard;