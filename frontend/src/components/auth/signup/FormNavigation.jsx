// components/forms/FormNavigation/FormNavigation.jsx
import React from 'react';
import PropTypes from 'prop-types';
import styles from './FormNavigation.module.css';

const FormNavigation = ({
    currentStep,
    isSubmitting,
    onPreviousStep,
    onNextStep,
    onFinalSubmit,
    selectedProgramIdsLength, // Still passed, but not for disabling "Next" button
}) => {
    return (
        <div className={styles.formNavigationButtons}>
            {currentStep > 1 && (
                <button
                    type="button"
                    className={`${styles.button} ${styles.secondaryButton}`}
                    onClick={onPreviousStep}
                    disabled={isSubmitting}
                >
                    Back
                </button>
            )}

            {currentStep < 2 && (
                <button
                    type="button"
                    className={`${styles.button} ${styles.primaryButton}`}
                    onClick={onNextStep}
                    disabled={isSubmitting} // ONLY disabled if submitting
                >
                    Next
                </button>
            )}

            {currentStep === 2 && (
                <button
                    type="button"
                    className={`${styles.button} ${styles.primaryButton}`}
                    onClick={onFinalSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                </button>
            )}
        </div>
    );
};

FormNavigation.propTypes = {
    currentStep: PropTypes.number.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    onPreviousStep: PropTypes.func.isRequired,
    onNextStep: PropTypes.func.isRequired,
    onFinalSubmit: PropTypes.func.isRequired,
    selectedProgramIdsLength: PropTypes.number.isRequired,
};

export default FormNavigation;