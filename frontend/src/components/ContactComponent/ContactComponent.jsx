import React, { useState, useCallback, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faMapMarkerAlt, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import styles from "./ContactComponent.module.css"; // <--- Import CSS Module

const ContactComponent = () => {
  // --- State for Form Inputs ---
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  // --- State for UI Feedback ---
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState({ type: '', text: '' }); // { type: 'success' | 'error', text: 'message' }
  const [validationErrors, setValidationErrors] = useState({}); // Stores field-specific errors

  // --- Refs for Input Focus (for accessibility/UX on validation errors) ---
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const subjectRef = useRef(null);
  const messageRef = useRef(null);

  // --- Backend API URL ---
  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'; // Fallback for dev

  // --- Effect to clear response messages after a delay ---
  useEffect(() => {
    if (responseMessage.text) {
      const timer = setTimeout(() => {
        setResponseMessage({ type: '', text: '' });
      }, 7000); // Clear message after 7 seconds
      return () => clearTimeout(timer);
    }
  }, [responseMessage]);


  /**
   * Handles changes in form input fields.
   * Clears corresponding validation error when user starts typing.
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the specific validation error when the user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setResponseMessage({ type: '', text: '' }); // Clear global response on change
  }, [validationErrors]);


  /**
   * Performs client-side validation for the form.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = "Full Name is required.";
    }
    if (!formData.email.trim()) {
      errors.email = "Email Address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.subject.trim()) {
      errors.subject = "Subject is required.";
    }
    if (!formData.message.trim()) {
      errors.message = "Message cannot be empty.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);


  /**
   * Handles the form submission logic.
   * Performs validation and sends data to the backend.
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setResponseMessage({ type: '', text: '' }); // Clear previous messages
    setValidationErrors({}); // Clear previous validation errors

    const isValid = validateForm();
    if (!isValid) {
      // Focus on the first invalid field for better UX
      if (validationErrors.fullName && fullNameRef.current) fullNameRef.current.focus();
      else if (validationErrors.email && emailRef.current) emailRef.current.focus();
      else if (validationErrors.subject && subjectRef.current) subjectRef.current.focus();
      else if (validationErrors.message && messageRef.current) messageRef.current.focus();
      
      setResponseMessage({ type: 'error', text: 'Please correct the highlighted errors.' });
      return;
    }

    setLoading(true); // Start loading state

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/contact`, { // Assuming /api/contact endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorText = 'Failed to send message. Please try again.';
        try {
          const errorData = await response.json();
          errorText = errorData.message || errorText;
        } catch (jsonError) {
          errorText = response.statusText || `Server error: ${response.status}`;
        }
        throw new Error(errorText);
      }

      // const result = await response.json(); // If backend sends a success message or data

      setResponseMessage({ type: 'success', text: 'Your message has been sent successfully! We will get back to you shortly.' });
      setFormData({ // Clear form fields
        fullName: "",
        email: "",
        subject: "",
        message: "",
      });
      // Optionally focus on the first input after successful submission
      if (fullNameRef.current) fullNameRef.current.focus();

    } catch (error) {
      console.error("Contact form submission error:", error);
      setResponseMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setLoading(false); // End loading state
    }
  }, [formData, validateForm, BACKEND_API_URL, validationErrors]);


  return (
    <section className={styles.contactSection}> {/* Using styles.contactSection */}
      <div className={styles.contactContainer}> {/* Using styles.contactContainer */}
        <h1 className={styles.contactTitle}>Get in Touch with Zeelevate Academy</h1> {/* Using styles.contactTitle */}
        <p className={styles.contactDescription}> {/* Using styles.contactDescription */}
          Have questions about our courses, partnerships, or anything else? We're here to help!
          Fill out the form below or reach out to us using the contact details provided.
        </p>
        <div className={styles.contactRow}> {/* Using styles.contactRow */}
          <div className={styles.contactInfoCol}> {/* Using styles.contactInfoCol */}
            <div className={styles.infoItem}> {/* Using styles.infoItem */}
              <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.contactIcon} /> {/* Using styles.contactIcon */}
              <span>
                <h5>Minnesota</h5>
                <p>Find us in the heart of Minnesota!</p>
              </span>
            </div>

            <div className={styles.infoItem}>
              <FontAwesomeIcon icon={faPhone} className={styles.contactIcon} />
              <span>
                <h5>(651) 468-7345</h5>
                <p>Call us Monday to Friday, 9 AM - 5 PM CST</p>
              </span>
            </div>

            <div className={styles.infoItem}>
              <FontAwesomeIcon icon={faEnvelope} className={styles.contactIcon} />
              <span>
                <h5>tech@zeelevate.com</h5>
                <p>Send us your query anytime!</p>
              </span>
            </div>
          </div>

          <div className={styles.contactFormCol}> {/* Using styles.contactFormCol */}
            <form onSubmit={handleSubmit} className={styles.contactForm} noValidate> {/* Using styles.contactForm */}
              {responseMessage.text && (
                <div
                  className={`${styles.responseMessage} ${responseMessage.type === 'success' ? styles.successMessage : styles.errorMessage}`}
                  role="alert"
                  aria-atomic="true"
                >
                  {responseMessage.text}
                </div>
              )}

              <input
                type="text"
                name="fullName"
                placeholder="Your Full Name*"
                value={formData.fullName}
                onChange={handleChange}
                className={`${styles.formInput} ${validationErrors.fullName ? styles.inputError : ''}`}
                ref={fullNameRef}
                aria-required="true"
                aria-invalid={!!validationErrors.fullName}
                aria-describedby={validationErrors.fullName ? "fullName-error" : undefined}
              />
              {validationErrors.fullName && (
                <p id="fullName-error" className={styles.errorMessageText} role="alert">{validationErrors.fullName}</p>
              )}

              <input
                type="email"
                name="email"
                placeholder="Your Email Address*"
                value={formData.email}
                onChange={handleChange}
                className={`${styles.formInput} ${validationErrors.email ? styles.inputError : ''}`}
                ref={emailRef}
                aria-required="true"
                aria-invalid={!!validationErrors.email}
                aria-describedby={validationErrors.email ? "email-error" : undefined}
              />
              {validationErrors.email && (
                <p id="email-error" className={styles.errorMessageText} role="alert">{validationErrors.email}</p>
              )}

              <input
                type="text"
                name="subject"
                placeholder="Subject of Your Message*"
                value={formData.subject}
                onChange={handleChange}
                className={`${styles.formInput} ${validationErrors.subject ? styles.inputError : ''}`}
                ref={subjectRef}
                aria-required="true"
                aria-invalid={!!validationErrors.subject}
                aria-describedby={validationErrors.subject ? "subject-error" : undefined}
              />
              {validationErrors.subject && (
                <p id="subject-error" className={styles.errorMessageText} role="alert">{validationErrors.subject}</p>
              )}

              <textarea
                name="message"
                rows="6"
                placeholder="Write your message here...*"
                value={formData.message}
                onChange={handleChange}
                className={`${styles.formTextarea} ${validationErrors.message ? styles.inputError : ''}`}
                ref={messageRef}
                aria-required="true"
                aria-invalid={!!validationErrors.message}
                aria-describedby={validationErrors.message ? "message-error" : undefined}
              ></textarea>
              {validationErrors.message && (
                <p id="message-error" className={styles.errorMessageText} role="alert">{validationErrors.message}</p>
              )}

              <button type="submit" className={`${styles.ctaButton} ${styles.primaryCtaButton}`} disabled={loading}> {/* Using styles.ctaButton and styles.primaryCtaButton */}
                {loading ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactComponent;