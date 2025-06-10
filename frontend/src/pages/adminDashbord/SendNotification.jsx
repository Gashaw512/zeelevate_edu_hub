import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './SendNotification.module.css'; // Import CSS module

const SendNotification = ({ user }) => {
  // State for form inputs
  const [message, setMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState({ type: '', text: '' }); // { type: 'success' | 'error', text: '...' }
  const [validationErrors, setValidationErrors] = useState({}); // Stores validation errors for each field

  // Refs for input focus management
  const messageRef = useRef(null);
  const recipientIdRef = useRef(null);

  // Environment variable for backend URL
  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL;

  // Effect to automatically clear response messages after a delay
  useEffect(() => {
    if (responseMessage.text) {
      const timer = setTimeout(() => {
        setResponseMessage({ type: '', text: '' });
      }, 5000); // Clear message after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [responseMessage]);

  /**
   * Performs client-side validation.
   * @returns {boolean} True if form is valid, false otherwise.
   */
  const validateForm = useCallback(() => {
    const errors = {};
    if (!message.trim()) {
      errors.message = 'Notification message is required.';
    }
    if (!isGlobal && !recipientId.trim()) {
      errors.recipientId = 'Recipient ID is required for user-specific notifications.';
    }
    if (isGlobal && recipientId.trim()) {
      errors.recipientId = 'Recipient ID cannot be specified for global notifications.';
    }

    setValidationErrors(errors); // Update validation errors state
    return Object.keys(errors).length === 0; // Return true if no errors
  }, [message, recipientId, isGlobal]);

  /**
   * Handles the submission of the notification form.
   * Sends a POST request to the backend API.
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    setResponseMessage({ type: '', text: '' }); // Clear previous response messages
    setValidationErrors({}); // Clear previous validation errors

    // Run client-side validation
    const isValid = validateForm();
    if (!isValid) {
      // Focus on the first invalid field for better UX
      if (validationErrors.message && messageRef.current) {
        messageRef.current.focus();
      } else if (validationErrors.recipientId && recipientIdRef.current) {
        recipientIdRef.current.focus();
      }
      setResponseMessage({ type: 'error', text: 'Please correct the highlighted errors.' });
      return;
    }

    setLoading(true);

    try {
      const apiEndpoint = `${BACKEND_API_URL}/api/send-notification`; // Use dynamic backend URL

      const idToken = await user?.getIdToken();

      if (!idToken) {
        throw new Error("Authentication token not available. Please log in as an administrator.");
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          message: message.trim(), // Send trimmed message
          recipientId: isGlobal ? null : recipientId.trim(),
          isGlobal,
        }),
      });

      if (!response.ok) {
        let errorText = 'Failed to send notification.';
        try {
          const errorData = await response.json();
          errorText = errorData.message || errorText;
        } catch (jsonError) {
          errorText = response.statusText || `Server error: ${response.status}`;
        }
        throw new Error(errorText);
      }

      setResponseMessage({ type: 'success', text: 'Notification sent successfully!' });
      // Clear the form fields after successful submission
      setMessage('');
      setRecipientId('');
      setIsGlobal(false); // Reset global checkbox

      // Optionally, focus back on message input after successful send
      if (messageRef.current) {
        messageRef.current.focus();
      }

    } catch (error) {
      console.error("Error sending notification via API:", error);
      setResponseMessage({ type: 'error', text: `Failed to send notification: ${error.message}` });
    } finally {
      setLoading(false);
    }
  }, [message, recipientId, isGlobal, user, validateForm, validationErrors, BACKEND_API_URL]);

  return (
    <div className={styles.sendNotificationContainer}>
      <h2 className={styles.pageTitle}>Send New Notification</h2>
      <p className={styles.pageDescription}>Compose and send notifications to specific users or broadcast globally.</p>

      <form onSubmit={handleSubmit} className={styles.notificationForm} noValidate>
        {/* Notification Message Input */}
        <div className={styles.formGroup}>
          <label htmlFor="message" className={styles.label}>
            Notification Message: <span className={styles.requiredIndicator}>*</span>
          </label>
          <textarea
            id="message"
            ref={messageRef}
            className={`${styles.textarea} ${validationErrors.message ? styles.inputError : ''}`}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              // Clear error when user starts typing again
              if (validationErrors.message) {
                setValidationErrors(prev => ({ ...prev, message: undefined }));
              }
            }}
            rows="5"
            placeholder="Type your notification message here..."
            required
            aria-required="true"
            aria-describedby={validationErrors.message ? "message-error" : undefined}
            aria-invalid={!!validationErrors.message}
          />
          {validationErrors.message && (
            <p id="message-error" className={styles.errorMessageText} role="alert">
              {validationErrors.message}
            </p>
          )}
        </div>

        {/* Global Notification Checkbox */}
        <div className={styles.formGroup}>
          <input
            type="checkbox"
            id="isGlobal"
            className={styles.checkbox}
            checked={isGlobal}
            onChange={(e) => {
              setIsGlobal(e.target.checked);
              // Clear recipient ID and its error if switching to global
              if (e.target.checked) {
                setRecipientId('');
                if (validationErrors.recipientId) {
                  setValidationErrors(prev => ({ ...prev, recipientId: undefined }));
                }
              }
            }}
            aria-label="Send as global notification (visible to all users)"
          />
          <label htmlFor="isGlobal" className={styles.checkboxLabel}>Send as global notification (visible to all users)</label>
        </div>

        {/* Recipient ID Input (Conditionally rendered) */}
        {!isGlobal && (
          <div className={styles.formGroup}>
            <label htmlFor="recipientId" className={styles.label}>
              Recipient User ID: <span className={styles.requiredIndicator}>*</span>
            </label>
            <input
              type="text"
              id="recipientId"
              ref={recipientIdRef}
              className={`${styles.input} ${validationErrors.recipientId ? styles.inputError : ''}`}
              value={recipientId}
              onChange={(e) => {
                setRecipientId(e.target.value);
                // Clear error when user starts typing again
                if (validationErrors.recipientId) {
                  setValidationErrors(prev => ({ ...prev, recipientId: undefined }));
                }
              }}
              placeholder="Enter Firebase User ID (e.g., 'abc123xyz')"
              required={!isGlobal}
              aria-required={!isGlobal}
              aria-describedby={validationErrors.recipientId ? "recipientId-error" : undefined}
              aria-invalid={!!validationErrors.recipientId}
            />
            <p className={styles.inputHint}>
              This is the unique Firebase User ID for the individual you want to notify.
            </p>
            {validationErrors.recipientId && (
              <p id="recipientId-error" className={styles.errorMessageText} role="alert">
                {validationErrors.recipientId}
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading} // Disable button while loading
          aria-live="polite" // Announce changes to assistive technologies
        >
          {loading ? (
            <>
              <span className={styles.spinner} role="status" aria-label="Sending notification"></span> Sending...
            </>
          ) : (
            'Send Notification'
          )}
        </button>

        {/* Response Message Feedback */}
        {responseMessage.text && (
          <p
            className={`${styles.responseMessage} ${
              responseMessage.type === 'success' ? styles.successMessage : styles.errorMessage
            }`}
            role="alert" // For accessibility
            aria-atomic="true" // Announce the entire content of the message
          >
            {responseMessage.text}
          </p>
        )}
      </form>
    </div>
  );
};

SendNotification.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired,
    getIdToken: PropTypes.func.isRequired,
  }).isRequired,
};

export default SendNotification;