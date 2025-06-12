// src/components/Admin/ManageCourses.jsx
import  { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import styles from './AddProgram.module.css'; // Reusing styles
import { Link } from 'react-router-dom';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const handleDeleteCourse = async (courseId, courseName) => {
    if (window.confirm(`Are you sure you want to delete the course "${courseName}"? This action cannot be undone and may affect existing programs!`)) {
      try {
        await deleteDoc(doc(db, 'courses', courseId));
        setDeleteMessage({ type: 'success', text: `Course "${courseName}" deleted successfully.` });
        // Optionally, you might need to run a cloud function to remove this courseId from any programs that reference it
      } catch (error) {
        console.error("Error deleting course:", error);
        setDeleteMessage({ type: 'error', text: `Failed to delete course: ${error.message}` });
      }
    }
  };

  if (loading) {
    return <div className={styles.adminContainer}><p>Loading courses...</p></div>;
  }

  if (error) {
    return <div className={styles.adminContainer}><p className={styles.errorText}>{error}</p></div>;
  }

  return (
    <div className={styles.adminContainer}>
      <h2 className={styles.adminHeading}>Manage Courses</h2>
      <p className={styles.componentDescription}>
        View, add, edit, or delete individual course definitions. These courses can then be included in larger programs.
      </p>

      <div className={styles.formSection}> {/* Reusing formSection for grouping */}
        <div className={styles.addCourseHeader}>
          <h3 className={styles.sectionTitle}>All Defined Courses</h3>
          <Link to="/admin/courses/add" className={styles.addCourseButton}>
            + Add New Course
          </Link>
        </div>

        {deleteMessage.text && (
          <p className={`${styles.message} ${styles[deleteMessage.type]}`}>
            {deleteMessage.text}
          </p>
        )}

        {courses.length === 0 ? (
          <p>No courses found. Start by adding a new course!</p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Instructor</th>
                <th>Level</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>{course.name}</td>
                  <td>{course.instructor || 'N/A'}</td>
                  <td>{course.level || 'N/A'}</td>
                  <td>{course.duration || 'N/A'}</td>
                  <td>
                    <Link to={`/admin/courses/edit/${course.id}`} className={styles.actionButtonEdit}>Edit</Link>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.name)}
                      className={styles.actionButtonDelete}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageCourses;