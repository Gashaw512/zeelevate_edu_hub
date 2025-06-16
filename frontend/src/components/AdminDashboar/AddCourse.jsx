// src/components/Admin/AddCourse.jsx
import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firestore'; // Your Firebase Firestore instance
import styles from './AddCourse.module.css'; // Specific styles for AddCourse
import commonStyles from './AddProgram.module.css'; // Reusing common admin styles

/**
 * Validates the course data before submission.
 * @param {object} formData - The course's main form data.
 * @param {Array<string>} selectedProgramIds - Array of IDs of selected programs.
 * @returns {object} - An object with error messages, or empty if valid.
 */
const validateCourseData = (formData, selectedProgramIds) => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = "Course Name is required.";
  }
  if (!formData.instructor.trim()) {
    errors.instructor = "Instructor name is required.";
  }
  if (!formData.duration.trim()) {
    errors.duration = "Duration is required.";
  }
  if (!formData.level.trim()) {
    errors.level = "Level is required.";
  }

  // Optional: If a course MUST belong to at least one program
  if (selectedProgramIds.length === 0) {
    errors.programs = "At least one program must be selected for the course.";
  }

  // Validate comma-separated lists
  if (formData.prerequisites.trim() && formData.prerequisites.split(',').some(item => !item.trim())) {
    errors.prerequisites = "Prerequisites list contains empty items. Please check commas.";
  }
  if (formData.syllabus.trim() && formData.syllabus.split(',').some(item => !item.trim())) {
    errors.syllabus = "Syllabus list contains empty items. Please check commas.";
  }

  return errors;
};

const AddCourse = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructor: '',
    duration: '', // e.g., "8 weeks", "3 months"
    level: 'Beginner', // e.g., Beginner, Intermediate, Advanced
    image: '', // URL to course image
    prerequisites: '', // comma-separated string
    syllabus: '', // comma-separated string
  });

  const [availablePrograms, setAvailablePrograms] = useState([]); // All existing programs ({id, name})
  const [selectedProgramIds, setSelectedProgramIds] = useState([]); // IDs of programs selected for this course

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [formErrors, setFormErrors] = useState({}); // State for field-specific errors

  // --- Fetch Available Programs on Component Mount ---
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const programsCollectionRef = collection(db, 'programs');
        const querySnapshot = await getDocs(programsCollectionRef);
        const programsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().title // Assuming 'title' is the program name
        }));
        setAvailablePrograms(programsData);
      } catch (error) {
        console.error("Error fetching available programs:", error);
        setSubmitMessage({ type: 'error', text: "Failed to load available programs. Please try again." });
      }
    };
    fetchPrograms();
  }, []); // Empty dependency array means this runs once on mount

  // --- Handlers ---

  // Handler for course-level fields
  const handleCourseChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    // Clear specific error if user starts typing again
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  }, [formErrors]);

  // Handler for program checkbox selection
  const handleProgramSelection = useCallback((e) => {
    const { value, checked } = e.target;
    setSelectedProgramIds(prevSelected => {
      const newSelection = checked
        ? [...prevSelected, value] // Add program ID
        : prevSelected.filter(id => id !== value); // Remove program ID
      
      // Clear program-specific error if selection is made
      if (formErrors.programs && newSelection.length > 0) {
        setFormErrors(prevErrors => ({ ...prevErrors, programs: '' }));
      }
      return newSelection;
    });
  }, [formErrors]);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });
    setFormErrors({}); // Clear previous form errors

    const validationErrors = validateCourseData(formData, selectedProgramIds);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSubmitMessage({ type: 'error', text: "Please correct the errors in the form." });
      setIsSubmitting(false);
      return;
    }

    try {
      // Process comma-separated strings to arrays
      const prerequisitesArray = formData.prerequisites
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

      const syllabusArray = formData.syllabus
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

      // Get names of selected programs for denormalization
      const selectedProgramNames = availablePrograms
        .filter(program => selectedProgramIds.includes(program.id))
        .map(program => program.name);

      const newCourseData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        instructor: formData.instructor.trim(),
        duration: formData.duration.trim(),
        level: formData.level.trim(),
        image: formData.image.trim() || null,
        prerequisites: prerequisitesArray,
        syllabus: syllabusArray,
        programIds: selectedProgramIds,   // Store selected program IDs
        programNames: selectedProgramNames, // Store denormalized program names
        createdAt: serverTimestamp(),
      };

      // Add the new course document to 'courses' collection
      const docRef = await addDoc(collection(db, 'courses'), newCourseData);

      setSubmitMessage({ type: 'success', text: `Course "${formData.name}" added successfully! ID: ${docRef.id}` });

      // Reset form
      setFormData({
        name: '', description: '', instructor: '', duration: '',
        level: 'Beginner', image: '', prerequisites: '', syllabus: '',
      });
      setSelectedProgramIds([]); // Clear selected programs
      setFormErrors({});

    } catch (error) {
      console.error("Error adding course:", error);
      setSubmitMessage({ type: 'error', text: `Failed to add course: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={commonStyles.adminContainer}>
      <h2 className={commonStyles.adminHeading}>Add New Course</h2>
      <p className={commonStyles.componentDescription}>
        Create a new course and associate it with one or more existing programs.
      </p>
      <form onSubmit={handleSubmit} className={commonStyles.programForm}>
        {/* --- Course Details Section --- */}
        <div className={commonStyles.formSection}>
          <h3 className={commonStyles.sectionTitle}>Course Information</h3>
          <p className={commonStyles.sectionHint}>
            Provide details for the new course. Fields marked with <span className={commonStyles.required}>*</span> are required.
          </p>

          <div className={commonStyles.formGroup}>
            <label htmlFor="name">Course Name <span className={commonStyles.required}>*</span>:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleCourseChange}
              required
              placeholder="e.g., Introduction to Python Programming"
              className={formErrors.name ? commonStyles.inputError : ''}
              aria-invalid={formErrors.name ? "true" : "false"}
            />
            {formErrors.name && <p className={commonStyles.errorText}>{formErrors.name}</p>}
          </div>

          <div className={commonStyles.formGroup}>
            <label htmlFor="description">Description (Optional):</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleCourseChange}
              rows="4"
              placeholder="A brief overview of the course content."
            ></textarea>
          </div>

          <div className={commonStyles.formRow}>
            <div className={commonStyles.formGroup}>
              <label htmlFor="instructor">Instructor <span className={commonStyles.required}>*</span>:</label>
              <input
                type="text"
                id="instructor"
                name="instructor"
                value={formData.instructor}
                onChange={handleCourseChange}
                required
                placeholder="e.g., Jane Doe"
                className={formErrors.instructor ? commonStyles.inputError : ''}
                aria-invalid={formErrors.instructor ? "true" : "false"}
              />
              {formErrors.instructor && <p className={commonStyles.errorText}>{formErrors.instructor}</p>}
            </div>
            <div className={commonStyles.formGroup}>
              <label htmlFor="duration">Duration <span className={commonStyles.required}>*</span>:</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleCourseChange}
                required
                placeholder="e.g., 8 weeks or 3 months"
                className={formErrors.duration ? commonStyles.inputError : ''}
                aria-invalid={formErrors.duration ? "true" : "false"}
              />
              {formErrors.duration && <p className={commonStyles.errorText}>{formErrors.duration}</p>}
            </div>
          </div>

          <div className={commonStyles.formRow}>
            <div className={commonStyles.formGroup}>
              <label htmlFor="level">Level <span className={commonStyles.required}>*</span>:</label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleCourseChange}
                required
                className={formErrors.level ? commonStyles.inputError : ''}
                aria-invalid={formErrors.level ? "true" : "false"}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              {formErrors.level && <p className={commonStyles.errorText}>{formErrors.level}</p>}
            </div>
            <div className={commonStyles.formGroup}>
              <label htmlFor="image">Image URL (Optional):</label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleCourseChange}
                placeholder="e.g., https://example.com/course-image.jpg"
              />
            </div>
          </div>

          <div className={commonStyles.formGroup}>
            <label htmlFor="prerequisites">Prerequisites (comma-separated, optional):</label>
            <textarea
              id="prerequisites"
              name="prerequisites"
              value={formData.prerequisites}
              onChange={handleCourseChange}
              rows="3"
              placeholder="e.g., Basic Algebra, Intro to Logic"
            ></textarea>
            <small className={commonStyles.inputHint}>Separate each prerequisite with a comma. Leave blank if none.</small>
            {formErrors.prerequisites && <p className={commonStyles.errorText}>{formErrors.prerequisites}</p>}
          </div>

          <div className={commonStyles.formGroup}>
            <label htmlFor="syllabus">Syllabus Highlights (comma-separated, optional):</label>
            <textarea
              id="syllabus"
              name="syllabus"
              value={formData.syllabus}
              onChange={handleCourseChange}
              rows="4"
              placeholder="e.g., Week 1: Variables, Week 2: Control Flow, Week 3: Functions"
            ></textarea>
            <small className={commonStyles.inputHint}>Separate each syllabus point with a comma. Leave blank if none.</small>
            {formErrors.syllabus && <p className={commonStyles.errorText}>{formErrors.syllabus}</p>}
          </div>
        </div> {/* End Course Details Section */}

        {/* --- Program Association Section --- */}
        <div className={commonStyles.coursesSection}> {/* Reusing this CSS class for layout */}
          <div className={commonStyles.addCourseHeader}>
            <h3 className={commonStyles.sectionTitle}>Associate with Programs <span className={commonStyles.required}>*</span></h3>
          </div>
          <p className={commonStyles.sectionHint}>
            Select which existing programs this new course belongs to. At least one program is recommended.
            <br/>
            (If a program is missing, please add it via the 'Add New Program' administration page first).
          </p>

          {availablePrograms.length === 0 ? (
            <p className={commonStyles.loadingMessage}>Loading available programs, please wait...</p>
          ) : (
            <div className={commonStyles.courseSelectionGrid}> {/* Reusing this CSS class for layout */}
              {availablePrograms.map((program) => (
                <div key={program.id} className={commonStyles.courseCheckboxItem}> {/* Reusing this CSS class for styling */}
                  <input
                    type="checkbox"
                    id={`program-${program.id}`}
                    value={program.id}
                    checked={selectedProgramIds.includes(program.id)}
                    onChange={handleProgramSelection}
                  />
                  <label htmlFor={`program-${program.id}`}>{program.name}</label>
                </div>
              ))}
            </div>
          )}
          {formErrors.programs && <p className={commonStyles.errorText}>{formErrors.programs}</p>}
        </div> {/* End Program Association Section */}

        <button type="submit" className={commonStyles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Adding Course...' : 'Add Course'}
        </button>

        {submitMessage.text && (
          <p className={`${commonStyles.message} ${commonStyles[submitMessage.type]}`}>
            {submitMessage.text}
          </p>
        )}
      </form>
    </div>
  );
};

export default AddCourse;