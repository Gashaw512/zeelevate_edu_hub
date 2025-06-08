// src/components/Admin/AddProgram.jsx
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firestore'; 
import styles from './AddProgram.module.css'; // We'll create this CSS module next

const AddProgram = () => {
  // State for all form fields
  const [formData, setFormData] = useState({
    title: '',
    price: '',       // Will be parsed to number
    fullPrice: '',   // Will be parsed to number
    badge: '',       // Optional text
    status: 'available', // Default status for new programs
    order: '',       // Will be parsed to number, for custom sorting
  });

  // State for fields that are arrays, entered as comma-separated strings
  const [coursesInput, setCoursesInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');

  // State for form submission status and messages
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' }); // type: 'success' | 'error'

  // Generic handler for text and number inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission
    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' }); // Clear any previous messages

    try {
      // Basic client-side validation
      if (!formData.title || !formData.price || !formData.fullPrice) {
        throw new Error("Title, Monthly Price, and Full Course Price are required.");
      }
      if (isNaN(parseFloat(formData.price)) || isNaN(parseFloat(formData.fullPrice))) {
        throw new Error("Price and Full Course Price must be valid numbers.");
      }
      if (formData.order && isNaN(parseInt(formData.order))) {
        throw new Error("Display Order must be a valid number if provided.");
      }

      // Convert comma-separated strings to arrays
      const coursesArray = coursesInput.split(',').map(item => item.trim()).filter(item => item !== '');
      const featuresArray = featuresInput.split(',').map(item => item.trim()).filter(item => item !== '');

      // Prepare data for Firestore
      const newProgramData = {
        title: formData.title,
        price: parseFloat(formData.price), // Store as number
        fullPrice: parseFloat(formData.fullPrice), // Store as number
        badge: formData.badge || null, // Store null if badge is empty
        status: formData.status,
        order: formData.order ? parseInt(formData.order) : 999, // Default order if not provided
        courses: coursesArray,
        features: featuresArray,
        createdAt: serverTimestamp(), // Firebase's server timestamp
      };

      // Add the new program document to the 'programs' collection in Firestore
      await addDoc(collection(db, 'programs'), newProgramData);

      setSubmitMessage({ type: 'success', text: 'Program added successfully!' });

      // Reset form fields after successful submission
      setFormData({
        title: '',
        price: '',
        fullPrice: '',
        badge: '',
        status: 'available',
        order: '',
      });
      setCoursesInput('');
      setFeaturesInput('');

    } catch (error) {
      console.error("Error adding program:", error);
      setSubmitMessage({ type: 'error', text: `Failed to add program: ${error.message}` });
    } finally {
      setIsSubmitting(false); // Enable the submit button again
    }
  };

  return (
    <div className={styles.adminContainer}>
      <h2 className={styles.adminHeading}>Add New Program</h2>
      <form onSubmit={handleSubmit} className={styles.programForm}>
        {/* Program Title */}
        <div className={styles.formGroup}>
          <label htmlFor="title">Program Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Teen Programs (Ages 13-18)"
          />
        </div>

        {/* Pricing */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="price">Monthly Price ($):</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              required
              placeholder="e.g., 49.99"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="fullPrice">Full Course Price ($):</label>
            <input
              type="number"
              id="fullPrice"
              name="fullPrice"
              value={formData.fullPrice}
              onChange={handleChange}
              step="0.01"
              required
              placeholder="e.g., 299.99"
            />
          </div>
        </div>

        {/* Badge */}
        <div className={styles.formGroup}>
          <label htmlFor="badge">Badge Text (Optional):</label>
          <input
            type="text"
            id="badge"
            name="badge"
            value={formData.badge}
            onChange={handleChange}
            placeholder="e.g., Most Popular 🔥 or New! 🚀"
          />
        </div>

        {/* Status and Order */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="status">Program Status:</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable (Coming Soon)</option>
              <option value="full">Full</option>
              <option value="beta">Beta Access</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="order">Display Order (Lower number = higher priority):</label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              placeholder="e.g., 1 (for first), 2, 3..."
            />
          </div>
        </div>

        {/* Courses Input (textarea for comma-separated list) */}
        <div className={styles.formGroup}>
          <label htmlFor="coursesInput">Included Courses (comma-separated):</label>
          <textarea
            id="coursesInput"
            value={coursesInput}
            onChange={(e) => setCoursesInput(e.target.value)}
            rows="4"
            placeholder="e.g., Python Programming Basics, Web Development Fundamentals, Digital Literacy Essentials"
          ></textarea>
          <small className={styles.inputHint}>Separate each course with a comma.</small>
        </div>

        {/* Features Input (textarea for comma-separated list) */}
        <div className={styles.formGroup}>
          <label htmlFor="featuresInput">Program Features (comma-separated):</label>
          <textarea
            id="featuresInput"
            value={featuresInput}
            onChange={(e) => setFeaturesInput(e.target.value)}
            rows="4"
            placeholder="e.g., Interactive coding projects, College application guidance, Peer collaboration features"
          ></textarea>
          <small className={styles.inputHint}>Separate each feature with a comma.</small>
        </div>

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Adding Program...' : 'Add Program'}
        </button>

        {/* Submission Message */}
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