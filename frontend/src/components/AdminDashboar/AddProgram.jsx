import  { useState, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import styles from './AddProgram.module.css';
import CourseFormSection from './CourseFormSection'; // Import the new component

/**
 * Validates the program data before submission.
 * @param {object} formData - The program's main form data.
 * @param {Array<object>} courses - Array of course objects.
 * @returns {string | null} - An error message if validation fails, otherwise null.
 */
const validateProgramData = (formData, courses) => {
  if (!formData.title.trim()) {
    return "Program Title is required.";
  }
  if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
    return "Monthly Price is required and must be a valid number.";
  }
  if (formData.fullPrice.trim() && isNaN(parseFloat(formData.fullPrice))) {
    return "Full Course Price must be a valid number if provided.";
  }
  if (formData.order.trim() && isNaN(parseInt(formData.order))) {
    return "Display Order must be a valid number if provided.";
  }

  if (courses.length === 0) {
    return "At least one course is required for the program.";
  }
  for (const course of courses) {
    if (!course.name.trim()) {
      return `Course #${courses.indexOf(course) + 1} requires a name.`;
    }
  }

  return null; // All validations passed
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

  const [courses, setCourses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [formErrors, setFormErrors] = useState({}); // State for field-specific errors

  // Handler for program-level fields
  const handleProgramChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' })); // Clear error on change
  }, []);

  // Handler for adding a new course section
  const handleAddCourse = useCallback(() => {
    setCourses(prevCourses => [
      ...prevCourses,
      {
        id: Date.now().toString(), // Unique ID for keying
        name: '', description: '', instructor: '', duration: '',
        level: '', image: '', prerequisites: '', syllabus: '',
      },
    ]);
  }, []);

  // Handler for removing a course section
  const handleRemoveCourse = useCallback((id) => {
    setCourses(prevCourses => prevCourses.filter(course => course.id !== id));
  }, []);

  // Handler for changes within a specific course section
  const handleCourseChange = useCallback((id, e) => {
    const { name, value } = e.target;
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === id ? { ...course, [name]: value } : course
      )
    );
  }, []);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });
    setFormErrors({}); // Clear previous form errors

    const validationError = validateProgramData(formData, courses);
    if (validationError) {
      setSubmitMessage({ type: 'error', text: validationError });
      setIsSubmitting(false);
      return;
    }

    try {
      // Process data for Firestore
      const featuresArray = formData.features
        .split(',')
        .map(item => item.trim())
        .filter(Boolean); // Filter out empty strings

      const processedCourses = courses.map(course => ({
        name: course.name.trim(),
        description: course.description.trim() || null,
        instructor: course.instructor.trim() || null,
        duration: course.duration.trim() || null,
        level: course.level.trim() || null,
        image: course.image.trim() || null,
        prerequisites: course.prerequisites
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
        syllabus: course.syllabus
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
      }));

      const newProgramData = {
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        fullPrice: formData.fullPrice.trim() ? parseFloat(formData.fullPrice) : null, // Store null if optional and empty
        badge: formData.badge.trim() || null,
        status: formData.status,
        order: formData.order.trim() ? parseInt(formData.order) : 999, // Default order
        courses: processedCourses,
        features: featuresArray,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'programs'), newProgramData);

      setSubmitMessage({ type: 'success', text: `Program "${formData.title}" added successfully! ID: ${docRef.id}` });

      // Reset form
      setFormData({
        title: '', price: '', fullPrice: '', badge: '',
        status: 'available', order: '', features: '',
      });
      setCourses([]);
      setFormErrors({});

    } catch (error) {
      console.error("Error adding program:", error);
      setSubmitMessage({ type: 'error', text: `Failed to add program: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <h2 className={styles.adminHeading}>Add New Program</h2>
      <p className={styles.componentDescription}>
        Use this form to define new educational programs, including their pricing, features, and the courses they encompass.
      </p>
      <form onSubmit={handleSubmit} className={styles.programForm}>
        {/* --- Program Details Section --- */}
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
              />
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

        {/* --- Courses Section --- */}
        <div className={styles.coursesSection}>
          <h3 className={styles.sectionTitle}>Included Courses <span className={styles.required}>*</span></h3>
          <p className={styles.sectionHint}>
            Define each course that is part of this program. At least one course is required, and each course needs a name.
          </p>
          {courses.length === 0 && submitMessage.type === 'error' && submitMessage.text.includes('course') && (
            <p className={styles.errorText}>Please add at least one course and ensure all course names are filled.</p>
          )}

          {courses.map((course, index) => (
            <CourseFormSection
              key={course.id}
              course={course}
              index={index}
              handleCourseChange={handleCourseChange}
              handleRemoveCourse={handleRemoveCourse}
            />
          ))}
          <button type="button" className={styles.addCourseButton} onClick={handleAddCourse}>
            Add Course
          </button>
        </div> {/* End Courses Section */}

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






// when the backend is ready, we will use the following code to add a program




// import React, { useState, useEffect, useCallback } from 'react';
// import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
// import { db } from '../../firebase/firestore';
// import styles from './AddProgram.module.css';


// const validateProgramFormData = (formData) => {
//   if (!formData.title.trim()) {
//     return { field: 'title', message: "Program Title is required." };
//   }
//   if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
//     return { field: 'price', message: "Monthly Price is required and must be a valid number." };
//   }
//   if (formData.fullPrice.trim() && isNaN(parseFloat(formData.fullPrice))) {
//     return { field: 'fullPrice', message: "Full Course Price must be a valid number if provided." };
//   }
//   if (formData.order.trim() && isNaN(parseInt(formData.order))) {
//     return { field: 'order', message: "Display Order must be a valid number if provided." };
//   }
//   return null;
// };

// const AddProgram = () => {
//   const [formData, setFormData] = useState({
//     title: '', price: '', fullPrice: '', badge: '',
//     status: 'available', order: '', features: '',
//   });

//   // State to hold all available courses fetched from Firestore
//   const [availableCourses, setAvailableCourses] = useState([]);
//   // State to hold the IDs of courses selected for THIS program
//   const [selectedCourseIds, setSelectedCourseIds] = useState([]);

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
//   const [formErrors, setFormErrors] = useState({}); // Field-specific errors

//   // Fetch all available courses from Firestore on component mount
//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const q = query(collection(db, 'courses'), orderBy('name', 'asc'));
//         const querySnapshot = await getDocs(q);
//         const coursesList = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           name: doc.data().name, // Only need ID and name for selection
//         }));
//         setAvailableCourses(coursesList);
//       } catch (error) {
//         console.error("Error fetching available courses:", error);
//         setSubmitMessage({ type: 'error', text: "Failed to load courses for selection." });
//       }
//     };
//     fetchCourses();
//   }, []);

//   // Handler for program-level fields
//   const handleProgramChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setFormData(prevData => ({ ...prevData, [name]: value }));
//     setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' })); // Clear error on change
//   }, []);

//   // Handler for selecting/deselecting courses
//   const handleCourseSelection = useCallback((e) => {
//     const { value, checked } = e.target;
//     setSelectedCourseIds(prevIds => {
//       if (checked) {
//         return [...prevIds, value]; // Add ID if checked
//       } else {
//         return prevIds.filter(id => id !== value); // Remove ID if unchecked
//       }
//     });
//   }, []);

//   // Form submission handler
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setSubmitMessage({ type: '', text: '' });
//     setFormErrors({});

//     // Validate program-level fields
//     const programValidationError = validateProgramFormData(formData);
//     if (programValidationError) {
//       setFormErrors({ [programValidationError.field]: programValidationError.message });
//       setSubmitMessage({ type: 'error', text: programValidationError.message });
//       setIsSubmitting(false);
//       return;
//     }

//     // Validate selected courses
//     if (selectedCourseIds.length === 0) {
//       setSubmitMessage({ type: 'error', text: "Please select at least one course for the program." });
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const featuresArray = formData.features
//         .split(',')
//         .map(item => item.trim())
//         .filter(Boolean);

//       const newProgramData = {
//         title: formData.title.trim(),
//         price: parseFloat(formData.price),
//         fullPrice: formData.fullPrice.trim() ? parseFloat(formData.fullPrice) : null,
//         badge: formData.badge.trim() || null,
//         status: formData.status,
//         order: formData.order.trim() ? parseInt(formData.order) : 999,
//         courseIds: selectedCourseIds, // Store only the IDs!
//         features: featuresArray,
//         createdAt: serverTimestamp(),
//       };

//       const docRef = await addDoc(collection(db, 'programs'), newProgramData);

//       setSubmitMessage({ type: 'success', text: `Program "${formData.title}" added successfully! ID: ${docRef.id}` });

//       // Reset form fields
//       setFormData({
//         title: '', price: '', fullPrice: '', badge: '',
//         status: 'available', order: '', features: '',
//       });
//       setSelectedCourseIds([]); // Clear selected courses
//       setFormErrors({});

//     } catch (error) {
//       console.error("Error adding program:", error);
//       setSubmitMessage({ type: 'error', text: `Failed to add program: ${error.message}` });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className={styles.adminContainer}>
//       <h2 className={styles.adminHeading}>Add New Program</h2>
//       <p className={styles.componentDescription}>
//         Define new educational programs by selecting from pre-defined courses.
//       </p>
//       <form onSubmit={handleSubmit} className={styles.programForm}>

//         {/* --- Program Details Section --- */}
//         <div className={styles.formSection}>
//           <h3 className={styles.sectionTitle}>Program Information</h3>
//           <p className={styles.sectionHint}>
//             Provide general details for the program. Fields marked with <span className={styles.required}>*</span> are required.
//           </p>

//           <div className={styles.formGroup}>
//             <label htmlFor="title">Program Title <span className={styles.required}>*</span>:</label>
//             <input
//               type="text"
//               id="title"
//               name="title"
//               value={formData.title}
//               onChange={handleProgramChange}
//               required
//               placeholder="e.g., Teen Programs (Ages 13-18)"
//               className={formErrors.title ? styles.inputError : ''}
//               aria-invalid={formErrors.title ? "true" : "false"}
//             />
//             {formErrors.title && <p className={styles.errorText}>{formErrors.title}</p>}
//           </div>

//           <div className={styles.formRow}>
//             <div className={styles.formGroup}>
//               <label htmlFor="price">Monthly Price ($) <span className={styles.required}>*</span>:</label>
//               <input
//                 type="number"
//                 id="price"
//                 name="price"
//                 value={formData.price}
//                 onChange={handleProgramChange}
//                 step="0.01"
//                 required
//                 placeholder="e.g., 49.99"
//                 className={formErrors.price ? styles.inputError : ''}
//                 aria-invalid={formErrors.price ? "true" : "false"}
//               />
//               {formErrors.price && <p className={styles.errorText}>{formErrors.price}</p>}
//             </div>
//             <div className={styles.formGroup}>
//               <label htmlFor="fullPrice">Full Course Price ($) (Optional):</label>
//               <input
//                 type="number"
//                 id="fullPrice"
//                 name="fullPrice"
//                 value={formData.fullPrice}
//                 onChange={handleProgramChange}
//                 step="0.01"
//                 placeholder="e.g., 299.99 (leave blank if not applicable)"
//                 className={formErrors.fullPrice ? styles.inputError : ''}
//                 aria-invalid={formErrors.fullPrice ? "true" : "false"}
//               />
//               {formErrors.fullPrice && <p className={styles.errorText}>{formErrors.fullPrice}</p>}
//             </div>
//           </div>

//           <div className={styles.formGroup}>
//             <label htmlFor="badge">Badge Text (Optional):</label>
//             <input
//               type="text"
//               id="badge"
//               name="badge"
//               value={formData.badge}
//               onChange={handleProgramChange}
//               placeholder="e.g., Most Popular 🔥 or New! 🚀"
//             />
//           </div>

//           <div className={styles.formRow}>
//             <div className={styles.formGroup}>
//               <label htmlFor="status">Program Status <span className={styles.required}>*</span>:</label>
//               <select
//                 id="status"
//                 name="status"
//                 value={formData.status}
//                 onChange={handleProgramChange}
//                 required
//               >
//                 <option value="available">Available</option>
//                 <option value="unavailable">Unavailable (Coming Soon)</option>
//                 <option value="full">Full</option>
//                 <option value="beta">Beta Access</option>
//               </select>
//             </div>
//             <div className={styles.formGroup}>
//               <label htmlFor="order">Display Order (Optional, lower number = higher priority):</label>
//               <input
//                 type="number"
//                 id="order"
//                 name="order"
//                 value={formData.order}
//                 onChange={handleProgramChange}
//                 placeholder="e.g., 1 (for first), 2, 3..."
//               />
//             </div>
//           </div>

//           <div className={styles.formGroup}>
//             <label htmlFor="features">Program Features (comma-separated, optional):</label>
//             <textarea
//               id="features"
//               name="features"
//               value={formData.features}
//               onChange={handleProgramChange}
//               rows="4"
//               placeholder="e.g., Interactive coding projects, College application guidance"
//             ></textarea>
//             <small className={styles.inputHint}>Separate each feature with a comma. Leave blank if none.</small>
//           </div>
//         </div>

//         {/* --- Courses Selection Section --- */}
//         <div className={styles.coursesSection}>
//           <h3 className={styles.sectionTitle}>Select Included Courses <span className={styles.required}>*</span></h3>
//           <p className={styles.sectionHint}>
//             Choose existing courses to include in this program. If a course isn't listed, add it first via the "Manage Courses" section.
//           </p>

//           {availableCourses.length === 0 ? (
//             <p>No courses available. Please create courses first via the "Manage Courses" section.</p>
//           ) : (
//             <div className={styles.courseSelectionGrid}>
//               {availableCourses.map((course) => (
//                 <div key={course.id} className={styles.courseCheckboxItem}>
//                   <input
//                     type="checkbox"
//                     id={`course-${course.id}`}
//                     value={course.id}
//                     checked={selectedCourseIds.includes(course.id)}
//                     onChange={handleCourseSelection}
//                   />
//                   <label htmlFor={`course-${course.id}`}>{course.name}</label>
//                 </div>
//               ))}
//             </div>
//           )}
//           {selectedCourseIds.length === 0 && submitMessage.type === 'error' && submitMessage.text.includes('course') && (
//             <p className={styles.errorText}>Please select at least one course.</p>
//           )}
//         </div>

//         <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
//           {isSubmitting ? 'Adding Program...' : 'Add Program'}
//         </button>

//         {submitMessage.text && (
//           <p className={`${styles.message} ${styles[submitMessage.type]}`}>
//             {submitMessage.text}
//           </p>
//         )}
//       </form>
//     </div>
//   );
// };

// export default AddProgram;