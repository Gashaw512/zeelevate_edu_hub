// src/components/Admin/SendNotification.jsx

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './SendNotification.module.css'; // Import CSS module

const SendNotification = ({ user }) => {
  // State for form inputs
  const [message, setMessage] = useState('');
  const [recipientId, setRecipientId] = useState(''); // For user-specific notifications
  const [isGlobal, setIsGlobal] = useState(false); // Checkbox for global notification

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState({ type: '', text: '' }); // { type: 'success' | 'error', text: '...' }

  /**
   * Handles the submission of the notification form.
   * Sends a POST request to the backend API.
   * Uses useCallback for memoization to prevent unnecessary re-renders.
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    setLoading(true); // Indicate loading state
    setResponseMessage({ type: '', text: '' }); // Clear previous messages

    // --- Basic Client-Side Validation ---
    if (!message.trim()) {
      setResponseMessage({ type: 'error', text: 'Notification message cannot be empty.' });
      setLoading(false);
      return;
    }
    if (!isGlobal && !recipientId.trim()) {
      setResponseMessage({ type: 'error', text: 'Recipient ID is required for user-specific notifications.' });
      setLoading(false);
      return;
    }
    if (isGlobal && recipientId.trim()) {
        setResponseMessage({ type: 'error', text: 'Cannot specify a recipient ID for a global notification.' });
        setLoading(false);
        return;
    }

    try {
      // IMPORTANT: Replace with your actual backend API endpoint
      // In a real app, you might use an environment variable like process.env.REACT_APP_API_URL
      const apiEndpoint = '/api/send-notification'; 

      // Fetch the admin user's ID token for backend authorization
      const idToken = await user?.getIdToken();

      if (!idToken) {
        throw new Error("Authentication token not available. Please log in as an administrator.");
      }

      // Send the request to the backend API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Pass the admin's Firebase ID token for backend verification
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          message,
          // Only send recipientId if it's not a global notification
          recipientId: isGlobal ? null : recipientId.trim(),
          isGlobal,
        }),
      });

      // Check for non-successful HTTP responses (e.g., 400, 401, 500)
      if (!response.ok) {
        let errorText = 'Failed to send notification.';
        try {
          const errorData = await response.json();
          errorText = errorData.message || errorText; // Use backend's error message if available
        } catch (jsonError) {
          // If response is not JSON (e.g., plain text error), use status text
          errorText = response.statusText || errorText;
        }
        throw new Error(errorText);
      }

      // If successful, parse the response (optional, backend might just send a success status)
      // const responseData = await response.json(); // Uncomment if backend sends success data

      // --- Success Feedback ---
      setResponseMessage({ type: 'success', text: 'Notification sent successfully!' });

      // Clear the form fields after successful submission
      setMessage('');
      setRecipientId('');
      setIsGlobal(false);

    } catch (error) {
      // --- Error Feedback ---
      console.error("Error sending notification via API:", error);
      setResponseMessage({ type: 'error', text: `Failed to send notification: ${error.message}` });
    } finally {
      setLoading(false); // End loading state
    }
  }, [message, recipientId, isGlobal, user]); // Dependencies for useCallback

  return (
    <div className={styles.sendNotificationContainer}>
      <h2 className={styles.pageTitle}>Send New Notification</h2>
      <p className={styles.pageDescription}>Compose and send notifications to specific users or broadcast globally.</p>

      <form onSubmit={handleSubmit} className={styles.notificationForm}>
        {/* Notification Message Input */}
        <div className={styles.formGroup}>
          <label htmlFor="message" className={styles.label}>Notification Message:</label>
          <textarea
            id="message"
            className={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="5"
            placeholder="Type your notification message here..."
            required
            aria-label="Notification message"
          />
        </div>

        {/* Global Notification Checkbox */}
        <div className={styles.formGroup}>
          <input
            type="checkbox"
            id="isGlobal"
            className={styles.checkbox}
            checked={isGlobal}
            onChange={(e) => setIsGlobal(e.target.checked)}
            aria-label="Send as global notification"
          />
          <label htmlFor="isGlobal" className={styles.checkboxLabel}>Send as global notification (visible to all users)</label>
        </div>

        {/* Recipient ID Input (Conditionally rendered) */}
        {!isGlobal && (
          <div className={styles.formGroup}>
            <label htmlFor="recipientId" className={styles.label}>Recipient User ID:</label>
            <input
              type="text"
              id="recipientId"
              className={styles.input}
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="Enter Firebase User ID (e.g., 'abc123xyz')"
              required={!isGlobal} // Only required if not global
              aria-label="Recipient user ID"
            />
            <p className={styles.inputHint}>
              This is the unique ID for the user you want to notify. Find it in your Firebase Authentication console.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>

        {/* Response Message Feedback */}
        {responseMessage.text && (
          <p
            className={`${styles.responseMessage} ${
              responseMessage.type === 'success' ? styles.successMessage : styles.errorMessage
            }`}
            role="alert" // For accessibility
          >
            {responseMessage.text}
          </p>
        )}
      </form>
    </div>
  );
};

// PropTypes for type checking the 'user' prop
SendNotification.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string.isRequired, // Firebase User ID
    getIdToken: PropTypes.func.isRequired, // Method to get auth token
  }).isRequired, // user prop is required for authentication
};

export default SendNotification;