import { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import { useEnrolledCourses } from "../../context/EnrolledCoursesContext";

import CourseCard from "../../components/Dashboard/CourseCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { XCircle, Info } from "lucide-react";

import styles from "./Courses.module.css";

// List component for displaying courses with loading/error/empty states
const CourseList = memo(({ courses, isLoading, fetchError }) => {
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
          <strong>Error loading courses:</strong> {fetchError}. Please try again later.
        </p>
      </div>
    );
  }

  if (!courses?.length) {
    return (
      <div className={styles.statusContainer}>
        <Info size={48} className={styles.infoIcon} />
        <p className={styles.statusMessage}>
          No enrolled courses found. Time to{" "}
          <Link to="/programs" className={styles.exploreLink}>
            explore some new programs
          </Link>
          !
        </p>
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
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      courseId: PropTypes.string,
      title: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
      instructor: PropTypes.string,
      progress: PropTypes.number,
      status: PropTypes.string,
      teachableLink: PropTypes.string,
      difficulty: PropTypes.string,
      duration: PropTypes.number,
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  fetchError: PropTypes.string,
};

// Main student dashboard page for displaying enrolled courses
const Courses = () => {
  const {
    enrolledCourses,
    loadingEnrolledCourses,
    enrolledCoursesError,
  } = useEnrolledCourses();

  const displayedCourses = useMemo(() => {
    return enrolledCourses.map(course => ({
      ...course,
      duration: Number(course.duration),
    }));
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
