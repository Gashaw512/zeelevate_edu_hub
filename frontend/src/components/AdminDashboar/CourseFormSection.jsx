// src/components/Admin/CourseFormSection.jsx
import React from 'react';
import styles from './AddProgram.module.css'; // Reusing styles from AddProgram

const CourseFormSection = ({ course, index, handleCourseChange, handleRemoveCourse }) => {
  return (
    <div key={course.id} className={styles.courseItem}>
      <button
        type="button"
        className={styles.removeCourseButton}
        onClick={() => handleRemoveCourse(course.id)}
        aria-label={`Remove Course ${index + 1}`}
      >
        &times;
      </button>

      <h4>Course #{index + 1}</h4>

      <div className={styles.formGroup}>
        <label htmlFor={`course-name-${course.id}`}>Course Name <span className={styles.required}>*</span>:</label>
        <input
          type="text"
          id={`course-name-${course.id}`}
          name="name"
          value={course.name}
          onChange={(e) => handleCourseChange(course.id, e)}
          required
          placeholder="e.g., Python Programming Basics"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor={`course-description-${course.id}`}>Description (Optional):</label>
        <textarea
          id={`course-description-${course.id}`}
          name="description"
          value={course.description}
          onChange={(e) => handleCourseChange(course.id, e)}
          rows="3"
          placeholder="A detailed description of the course content."
        ></textarea>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor={`course-instructor-${course.id}`}>Instructor (Optional):</label>
          <input
            type="text"
            id={`course-instructor-${course.id}`}
            name="instructor"
            value={course.instructor}
            onChange={(e) => handleCourseChange(course.id, e)}
            placeholder="e.g., Yohanes Fenta"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor={`course-duration-${course.id}`}>Duration (Optional):</label>
          <input
            type="text"
            id={`course-duration-${course.id}`}
            name="duration"
            value={course.duration}
            onChange={(e) => handleCourseChange(course.id, e)}
            placeholder="e.g., 8 weeks"
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor={`course-level-${course.id}`}>Level (Optional):</label>
          <input
            type="text"
            id={`course-level-${course.id}`}
            name="level"
            value={course.level}
            onChange={(e) => handleCourseChange(course.id, e)}
            placeholder="e.g., Beginner, Intermediate"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor={`course-image-${course.id}`}>Image URL (Optional):</label>
          <input
            type="text"
            id={`course-image-${course.id}`}
            name="image"
            value={course.image}
            onChange={(e) => handleCourseChange(course.id, e)}
            placeholder="e.g., https://example.com/images/python.jpg"
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor={`course-prerequisites-${course.id}`}>Prerequisites (comma-separated, optional):</label>
        <textarea
          id={`course-prerequisites-${course.id}`}
          name="prerequisites"
          value={course.prerequisites}
          onChange={(e) => handleCourseChange(course.id, e)}
          rows="2"
          placeholder="e.g., Basic math, Understanding of logic. Leave blank if none."
        ></textarea>
        <small className={styles.inputHint}>Separate each prerequisite with a comma.</small>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor={`course-syllabus-${course.id}`}>Syllabus Modules (comma-separated, optional):</label>
        <textarea
          id={`course-syllabus-${course.id}`}
          name="syllabus"
          value={course.syllabus}
          onChange={(e) => handleCourseChange(course.id, e)}
          rows="4"
          placeholder="e.g., Module 1: Intro, Module 2: Data Types. Leave blank if none."
        ></textarea>
        <small className={styles.inputHint}>Separate each module with a comma.</small>
      </div>
    </div>
  );
};

export default CourseFormSection;