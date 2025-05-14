import React from "react";
import PropTypes from 'prop-types';
import "./Courses.css";
import CourseCard from "./courseCard/CourseCard";

const Courses = ({
  title = "Explore Our Learning Tracks",
  subtitle = "Beginner-friendly courses for digital empowerment.",
  courses,
  enrollLabel = "Enroll Now",
}) => {
  return (
    <section className="course-section" aria-labelledby="course-heading">
      <div className="course-container">
        {title && <h2 id="course-heading" className="course-section__title">{title}</h2>}
        {subtitle && <p className="course-section__subtitle">{subtitle}</p>}

        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} enrollLabel={enrollLabel} />
          ))}
        </div>

        <div className="course-note">
          <p>
          All courses are hosted on <a href="https://www.teachable.com/" target="_blank" rel="noopener noreferrer">Teachable</a>.
          </p>
        </div>
      </div>
    </section>
  );
};

Courses.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      icon: PropTypes.node,
      title: PropTypes.string,
      description: PropTypes.string,
      price: PropTypes.number,
      duration: PropTypes.string,
      prerequisites: PropTypes.string,
      learningOutcomes: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  enrollLabel: PropTypes.string,
};

export default Courses;