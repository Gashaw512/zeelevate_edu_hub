// components/forms/FormNavigation/FormNavigation.jsx
import PropTypes from 'prop-types';
import styles from './FormNavigation.module.css';

const FormNavigation = ({
    currentStep,
    isSubmitting,
    onPreviousStep,
    onNextStep,
    onFinalSubmit,
    selectedProgramIdsLength, // Still passed, though 'isNextDisabled' now encapsulates its usage for button state
    isNextDisabled = false, // <-- NEW PROP: default to false
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

            {currentStep < 2 && ( // This is the "Next" button for Step 1
                <button
                    type="button"
                    className={`${styles.button} ${styles.primaryButton}`}
                    onClick={onNextStep}
                    disabled={isSubmitting || isNextDisabled} // <-- MODIFIED: Use isNextDisabled here
                >
                    Next
                </button>
            )}

            {currentStep === 2 && ( // This is the "Proceed to Payment" button for Step 2
                <button
                    type="button" // Should ideally be type="submit" if this triggers form submission directly
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
    selectedProgramIdsLength: PropTypes.number.isRequired, // Keep this, as SignUp calculates isNextDisabled with it
    isNextDisabled: PropTypes.bool, // <-- NEW PROP TYPE
};

export default FormNavigation;