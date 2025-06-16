import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, doc, writeBatch, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import styles from './AddProgram.module.css';
import { Link } from 'react-router-dom';

/**
 * Validates the program data before submission.
 * @param {object} formData - The program's main form data.
 * @param {Array<string>} selectedCourseIds - Array of IDs of selected courses.
 * @returns {object} - An object with error messages, or empty if valid.
 */
const validateProgramData = (formData, selectedCourseIds) => {
  const errors = {};

  if (!formData.title.trim()) {
    errors.title = "Program Title is required.";
  }
  if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
    errors.price = "Monthly Price is required and must be a valid number.";
  }
  if (formData.fullPrice.trim() && isNaN(parseFloat(formData.fullPrice))) {
    errors.fullPrice = "Full Course Price must be a valid number if provided.";
  }
  if (formData.order.trim() && isNaN(parseInt(formData.order))) {
    errors.order = "Display Order must be a valid number if provided.";
  }

  if (selectedCourseIds.length === 0) {
    errors.courses = "At least one course must be selected for the program.";
  }

  return errors;
};

const AddProgram = () => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    fullPrice: '',
    badge: '',
    status: 'available',
    order: '',
    features: '',
  });

  const [availableCourses, setAvailableCourses] = useState([]); // All existing courses ({id, name})
  const [selectedCourseIds, setSelectedCourseIds] = useState([]); // IDs of courses selected for this program
  const [courseSearchTerm, setCourseSearchTerm] = useState(''); // State for course search input
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true); // New loading state for courses

  // --- Fetch Available Courses on Component Mount ---
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoadingCourses(true); // Start loading
      try {
        const coursesCollectionRef = collection(db, 'courses');
        const querySnapshot = await getDocs(coursesCollectionRef);
        const coursesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name // Assuming 'name' is the course title, still important to ensure it exists
        }));
        setAvailableCourses(coursesData);
      } catch (error) {
        console.error("Error fetching available courses:", error);
        setSubmitMessage({ type: 'error', text: "Failed to load available courses. Please try again." });
      } finally {
        setIsLoadingCourses(false); // End loading
      }
    };
    fetchCourses();
  }, []);

  // Filter available courses for display
  const coursesToDisplay = useMemo(() => {
    const lowerCaseSearchTerm = courseSearchTerm.toLowerCase();
    return availableCourses.filter(course =>
      // Add a check here: ensure course.name exists and is a string before calling toLowerCase()
      course.name && typeof course.name === 'string' &&
      // Only show courses that are not already selected
      !selectedCourseIds.includes(course.id) &&
      // And match the search term (if present)
      course.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [availableCourses, courseSearchTerm, selectedCourseIds]);

  // Handler for program-level fields
  const handleProgramChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  }, [formErrors]);

  // Handler to add a course to the selected list
  const handleAddCourseToProgram = useCallback((courseId) => {
    setSelectedCourseIds(prevSelected => {
      const newSelection = [...prevSelected, courseId];
      if (formErrors.courses && newSelection.length > 0) {
        setFormErrors(prevErrors => ({ ...prevErrors, courses: '' }));
      }
      return newSelection;
    });
    setCourseSearchTerm(''); // Clear search term after adding
  }, [formErrors]);

  // Handler to remove a course from the selected list
  const handleRemoveCourseFromProgram = useCallback((courseId) => {
    setSelectedCourseIds(prevSelected => prevSelected.filter(id => id !== courseId));
  }, []);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });
    setFormErrors({});

    const validationErrors = validateProgramData(formData, selectedCourseIds);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSubmitMessage({ type: 'error', text: "Please correct the errors in the form." });
      setIsSubmitting(false);
      return;
    }

    try {
      const featuresArray = formData.features
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

      const newProgramData = {
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        fullPrice: formData.fullPrice.trim() ? parseFloat(formData.fullPrice) : null,
        badge: formData.badge.trim() || null,
        status: formData.status,
        order: formData.order.trim() ? parseInt(formData.order) : 999,
        features: featuresArray,
        createdAt: serverTimestamp(),
      };

      const programDocRef = await addDoc(collection(db, 'programs'), newProgramData);
      const newProgramId = programDocRef.id;
      const newProgramName = newProgramData.title;

      const batch = writeBatch(db);

      const selectedCourseObjects = availableCourses.filter(course =>
        selectedCourseIds.includes(course.id)
      );

      for (const course of selectedCourseObjects) {
        const courseRef = doc(db, 'courses', course.id);
        batch.update(courseRef, {
          programIds: arrayUnion(newProgramId),
          programNames: arrayUnion(newProgramName)
        });
      }

      await batch.commit();

      setSubmitMessage({ type: 'success', text: `Program "${formData.title}" added successfully! ID: ${newProgramId} and courses updated.` });

      // Reset form
      setFormData({
        title: '', price: '', fullPrice: '', badge: '',
        status: 'available', order: '', features: '',
      });
      setSelectedCourseIds([]);
      setCourseSearchTerm('');
      setFormErrors({});

    } catch (error) {
      console.error("Error adding program and updating courses:", error);
      setSubmitMessage({ type: 'error', text: `Failed to add program: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <h2 className={styles.adminHeading}>Add New Program</h2>
      <p className={styles.componentDescription}>
        Define new educational programs and link them to **existing courses**. This allows courses to be reused across multiple programs.
      </p>
      <form onSubmit={handleSubmit} className={styles.programForm}>
        {/* --- Program Details Section (No changes here from previous version) --- */}
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>Program Information</h3>
          <p className={styles.sectionHint}>
            Provide general details for the program. Fields marked with <span className={styles.required}>*</span> are required.
          </p>

          <div className={styles.formGroup}>
            <label htmlFor="title">Program Title <span className={styles.required}>*</span>:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleProgramChange}
              required
              placeholder="e.g., Teen Programs (Ages 13-18)"
              className={formErrors.title ? styles.inputError : ''}
              aria-invalid={formErrors.title ? "true" : "false"}
            />
            {formErrors.title && <p className={styles.errorText}>{formErrors.title}</p>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="price">Monthly Price ($) <span className={styles.required}>*</span>:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleProgramChange}
                step="0.01"
                required
                placeholder="e.g., 49.99"
                className={formErrors.price ? styles.inputError : ''}
                aria-invalid={formErrors.price ? "true" : "false"}
              />
              {formErrors.price && <p className={styles.errorText}>{formErrors.price}</p>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="fullPrice">Full Course Price ($) (Optional):</label>
              <input
                type="number"
                id="fullPrice"
                name="fullPrice"
                value={formData.fullPrice}
                onChange={handleProgramChange}
                step="0.01"
                placeholder="e.g., 299.99 (leave blank if not applicable)"
                className={formErrors.fullPrice ? styles.inputError : ''}
                aria-invalid={formErrors.fullPrice ? "true" : "false"}
              />
              {formErrors.fullPrice && <p className={styles.errorText}>{formErrors.fullPrice}</p>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="badge">Badge Text (Optional):</label>
            <input
              type="text"
              id="badge"
              name="badge"
              value={formData.badge}
              onChange={handleProgramChange}
              placeholder="e.g., Most Popular 🔥 or New! 🚀"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="status">Program Status <span className={styles.required}>*</span>:</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleProgramChange}
                required
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable (Coming Soon)</option>
                <option value="full">Full</option>
                <option value="beta">Beta Access</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="order">Display Order (Optional, lower number = higher priority):</label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleProgramChange}
                placeholder="e.g., 1 (for first), 2, 3..."
                className={formErrors.order ? styles.inputError : ''}
                aria-invalid={formErrors.order ? "true" : "false"}
              />
              {formErrors.order && <p className={styles.errorText}>{formErrors.order}</p>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="features">Program Features (comma-separated, optional):</label>
            <textarea
              id="features"
              name="features"
              value={formData.features}
              onChange={handleProgramChange}
              rows="4"
              placeholder="e.g., Interactive coding projects, College application guidance"
            ></textarea>
            <small className={styles.inputHint}>Separate each feature with a comma. Leave blank if none.</small>
          </div>
        </div> {/* End Program Details Section */}

        {/* --- Course Selection Section (Updated for professionalism and scalability) --- */}
        <div className={styles.coursesSection}>
          <div className={styles.sectionHeaderWithButton}>
            <h3 className={styles.sectionTitle}>Select Included Courses <span className={styles.required}>*</span></h3>
            <Link to="/admin/add-course" className={styles.addNewCourseButton}>
              + Add New Course
            </Link>
          </div>
          <p className={styles.sectionHint}>
            Search for and add existing courses to this program. You can also add new courses if needed.
          </p>

          <div className={styles.courseSelectionArea}>
            <div className={styles.courseSearchInputGroup}>
              <label htmlFor="courseSearch">Search Available Courses:</label>
              <input
                type="text"
                id="courseSearch"
                value={courseSearchTerm}
                onChange={(e) => setCourseSearchTerm(e.target.value)}
                placeholder="Type course name to search..."
                className={styles.searchInput}
              />
            </div>

            {isLoadingCourses ? (
              <p className={styles.loadingMessage}>Loading available courses...</p>
            ) : (
              <>
                {coursesToDisplay.length === 0 && availableCourses.length > 0 && selectedCourseIds.length === availableCourses.length ? (
                  <p className={styles.noAvailableCoursesMessage}>All available courses have been selected.</p>
                ) : coursesToDisplay.length === 0 && availableCourses.length > 0 && courseSearchTerm ? (
                  <p className={styles.noResultsMessage}>No other courses found matching "{courseSearchTerm}".</p>
                ) : coursesToDisplay.length === 0 && availableCourses.length === 0 ? (
                  <p className={styles.noResultsMessage}>No courses available yet. Please add a new course.</p>
                ) : (
                  <ul className={styles.filteredCoursesList}>
                    {coursesToDisplay.map(course => (
                      <li key={course.id}>
                        <span>{course.name}</span>
                        <button
                          type="button"
                          onClick={() => handleAddCourseToProgram(course.id)}
                          className={styles.addFilteredCourseButton}
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {selectedCourseIds.length > 0 && (
              <div className={styles.selectedCoursesDisplay}>
                <h4>Courses in this Program:</h4>
                <ul className={styles.selectedCoursesList}>
                  {selectedCourseIds.map(id => {
                    const course = availableCourses.find(c => c.id === id);
                    return course ? (
                      <li key={course.id}>
                        <span>{course.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCourseFromProgram(course.id)}
                          className={styles.removeSelectedCourseButton}
                          title="Remove course from program"
                        >
                          &times;
                        </button>
                      </li>
                    ) : null; // In case a course was selected but then deleted from DB
                  })}
                </ul>
              </div>
            )}
            {formErrors.courses && <p className={styles.errorText}>{formErrors.courses}</p>}
          </div>
        </div> {/* End Course Selection Section */}

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Adding Program...' : 'Add Program'}
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

export default AddProgram;