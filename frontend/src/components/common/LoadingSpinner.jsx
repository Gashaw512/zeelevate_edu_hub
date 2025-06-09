// src/components/Common/LoadingSpinner.jsx
import React from 'react';
import { FaSpinner } from 'react-icons/fa'; // Ensure you have react-icons installed

// Import the CSS module
import styles from './LoadingSpinner.module.css';

/**
 * A reusable and attractive loading spinner component.
 * @param {object} props
 * @param {string} [props.message='Processing your request...'] - The message to display below the spinner.
 */
const LoadingSpinner = ({ message = 'Processing your request...' }) => {
  return (
    <div className={styles.spinnerContainer}>
      <FaSpinner className={styles.spinnerIcon} />
      <p className={styles.spinnerMessage}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;