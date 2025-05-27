// Dashboard 'My Courses' page.
import { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './Courses.module.css';
import { mockCourses } from '../../data/index';
import CourseCard from '../../components/Dashboard/CourseCard';

// Memoized Course List for performance optimization
const CourseList = memo(({ courses }) => {
  if (!courses || courses.length === 0) {
    return <p>No enrolled courses found.</p>;
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
};

const Courses = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Enrolled Courses</h2>
      <CourseList courses={mockCourses} />
    </div>
  );
};

export default Courses;
