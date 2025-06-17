// components/forms/FormNavigation/FormNavigation.jsx
import PropTypes from 'prop-types';
import styles from './FormNavigation.module.css';

const FormNavigation = ({
    currentStep,
    isSubmitting,
    onPreviousStep,
    onNextStep,
    onFinalSubmit,
    selectedProgramIdsLength,
    isNextDisabled = false,
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
                    disabled={isSubmitting || isNextDisabled}
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
    selectedProgramIdsLength: PropTypes.number.isRequired, // Keep this, as SignUp calculates isNextDisabled with it
    isNextDisabled: PropTypes.bool, // <-- NEW PROP TYPE
};

export default FormNavigation;