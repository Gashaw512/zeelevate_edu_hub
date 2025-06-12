// src/components/Admin/CourseForm.jsx
import React, { useState, useEffect } from 'react'; // Make sure React is imported
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import styles from './AddProgram.module.css'; // Reusing styles, or create CourseForm.module.css
import { useParams, useNavigate } from 'react-router-dom';

const initialCourseData = {
  name: '',
  description: '',
  instructor: '',
  duration: '',
  level: '',
  image: '',
  prerequisites: '', // comma-separated string
  syllabus: '',       // comma-separated string
};

const CourseForm = () => {
  const { courseId } = useParams(); // For editing an existing course
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(initialCourseData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(courseId ? true : false); // Loading for fetch if editing

  useEffect(() => {
    if (courseId) {
      const fetchCourse = async () => {
        try {
          const docRef = doc(db, 'courses', courseId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setCourseData({
              ...data,
              prerequisites: data.prerequisites ? data.prerequisites.join(', ') : '',
              syllabus: data.syllabus ? data.syllabus.join(', ') : '',
            });
          } else {
            setSubmitMessage({ type: 'error', text: 'Course not found.' });
            navigate('/admin/courses'); // Redirect if not found
          }
        } catch (error) {
          console.error("Error fetching course:", error);
          setSubmitMessage({ type: 'error', text: `Error loading course: ${error.message}` });
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [courseId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prevData => ({ ...prevData, [name]: value }));
  };

  const validateCourseForm = () => {
    if (!courseData.name.trim()) {
      return "Course Name is required.";
    }
    // Add more validation as needed (e.g., instructor, duration)
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });

    const validationError = validateCourseForm();
    if (validationError) {
      setSubmitMessage({ type: 'error', text: validationError });
      setIsSubmitting(false);
      return;
    }

    try {
      const processedData = {
        name: courseData.name.trim(),
        description: courseData.description.trim() || null,
        instructor: courseData.instructor.trim() || null,
        duration: courseData.duration.trim() || null,
        level: courseData.level.trim() || null,
        image: courseData.image.trim() || null,
        prerequisites: courseData.prerequisites
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
        syllabus: courseData.syllabus
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
      };

      if (courseId) {
        // Update existing course
        const docRef = doc(db, 'courses', courseId);
        await updateDoc(docRef, {
          ...processedData,
          updatedAt: serverTimestamp(),
        });
        setSubmitMessage({ type: 'success', text: 'Course updated successfully!' });
      } else {
        // Add new course
        await addDoc(collection(db, 'courses'), {
          ...processedData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setSubmitMessage({ type: 'success', text: 'Course added successfully!' });
        setCourseData(initialCourseData); // Reset form for new entry
      }
    } catch (error) {
      console.error("Error saving course:", error);
      setSubmitMessage({ type: 'error', text: `Failed to save course: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for the "View All Courses" button
  const handleViewCourses = () => {
    navigate('/admin/courses'); // Navigate to the ManageCourses component
  };

  if (loading) {
    return <div className={styles.adminContainer}><p>Loading course...</p></div>;
  }

  return (
    <div className={styles.adminContainer}>
      <h2 className={styles.adminHeading}>{courseId ? 'Edit Course' : 'Add New Course'}</h2>
      <p className={styles.componentDescription}>
        {courseId ? 'Modify details of this course.' : 'Create a new standalone course that can be included in programs.'}
      </p>

      {/* Button to navigate to view all courses */}
      <button
        type="button" // Important: use type="button" to prevent form submission
        onClick={handleViewCourses}
        className={styles.viewCoursesButton} // Apply a new style for this button
      >
        View All Courses
      </button>

      <form onSubmit={handleSubmit} className={styles.programForm}> {/* Reusing programForm styles */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Course Details</h3>

          <div className={styles.formGroup}>
            <label htmlFor="name">Course Name <span className={styles.required}>*</span>:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={courseData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Introduction to JavaScript"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description (Optional):</label>
            <textarea
              id="description"
              name="description"
              value={courseData.description}
              onChange={handleChange}
              rows="3"
              placeholder="A detailed description of the course content."
            ></textarea>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="instructor">Instructor (Optional):</label>
              <input type="text" id="instructor" name="instructor" value={courseData.instructor} onChange={handleChange} placeholder="e.g., Jane Doe" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="duration">Duration (Optional):</label>
              <input type="text" id="duration" name="duration" value={courseData.duration} onChange={handleChange} placeholder="e.g., 6 weeks" />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="level">Level (Optional):</label>
              <input type="text" id="level" name="level" value={courseData.level} onChange={handleChange} placeholder="e.g., Intermediate" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="image">Image URL (Optional):</label>
              <input type="text" id="image" name="image" value={courseData.image} onChange={handleChange} placeholder="e.g., https://example.com/js.jpg" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="prerequisites">Prerequisites (comma-separated, optional):</label>
            <textarea id="prerequisites" name="prerequisites" value={courseData.prerequisites} onChange={handleChange} rows="2" placeholder="e.g., Basic math, HTML fundamentals"></textarea>
            <small className={styles.inputHint}>Separate each prerequisite with a comma.</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="syllabus">Syllabus Modules (comma-separated, optional):</label>
            <textarea id="syllabus" name="syllabus" value={courseData.syllabus} onChange={handleChange} rows="4" placeholder="e.g., Module 1: Variables, Module 2: Functions"></textarea>
            <small className={styles.inputHint}>Separate each module with a comma.</small>
          </div>
        </div>

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Saving Course...' : (courseId ? 'Update Course' : 'Add Course')}
        </button>

        {submitMessage.text && (
          <p className={`${styles.message} ${styles[submitMessage.type]}`}>
            {submitMessage.text}
          </p>
        )}
      </form>
    </div>
  );
};

export default CourseForm;