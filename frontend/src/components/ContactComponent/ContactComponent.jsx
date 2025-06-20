import React, { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faMapMarkerAlt, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import styles from "./ContactComponent.module.css"; // <--- Import CSS Module
import useContactForm from '../../hooks/useContactForm'; // <--- Import the custom hook

const ContactComponent = () => {
  
  const {
    formData,
    handleChange,
    handleSubmit,
    loading,
    responseMessage,
    validationErrors,

  } = useContactForm();

 
  const fullNameRef = useRef(null);
  const emailRef = useRef(null);
  const subjectRef = useRef(null);
  const messageRef = useRef(null);


  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.fullName && fullNameRef.current) fullNameRef.current.focus();
      else if (validationErrors.email && emailRef.current) emailRef.current.focus();
      else if (validationErrors.subject && subjectRef.current) subjectRef.current.focus();
      else if (validationErrors.message && messageRef.current) messageRef.current.focus();
    }
  }, [validationErrors]);


  return (
    <section className={styles.contactSection}>
      <div className={styles.contactContainer}>
        <h1 className={styles.contactTitle}>Get in Touch with Zeelevate Academy</h1>
        <p className={styles.contactDescription}>
          Have questions about our courses, partnerships, or anything else? We're here to help!
          Fill out the form below or reach out to us using the contact details provided.
        </p>
        <div className={styles.contactRow}>
          <div className={styles.contactInfoCol}>
            <div className={styles.infoItem}>
              <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.contactIcon} />
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

          <div className={styles.contactFormCol}>
            <form onSubmit={handleSubmit} className={styles.contactForm} noValidate>
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

              <button type="submit" className={`${styles.ctaButton} ${styles.primaryCtaButton}`} disabled={loading}>
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
