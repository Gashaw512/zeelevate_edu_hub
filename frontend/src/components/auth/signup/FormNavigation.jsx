import React from 'react';
import PropTypes from 'prop-types';

const FormNavigation = ({
  currentStep,
  isSubmitting,
  onPreviousStep,
  selectedProgramIdsLength, // Pass relevant data for button disabling
  formData, // Pass formData for final submit button disabling logic (if needed)
}) => {
  // Determine if the "Proceed to Payment" button should be disabled based on formData
  const isProceedToPaymentDisabled =
    isSubmitting ||
    !formData.email ||
    !formData.password ||
    formData.password !== formData.confirmPassword;

  return (
    <div className="form-navigation-buttons">
      {currentStep > 1 && (
        <button
          type="button"
          className="button secondary-button back-button"
          onClick={onPreviousStep}
        >
          Back
        </button>
      )}

      {currentStep < 2 && (
        <button
          type="submit" // This will trigger handleNextStep in parent form
          className="button primary-button next-button"
          disabled={isSubmitting} // As per best practice, let the handler validate
        >
          Next
        </button>
      )}

      {currentStep === 2 && (
        <button
          type="submit" // This will trigger handleSubmitFinalDetails in parent form
          className="button primary-button submit-enrollment-button"
          disabled={isSubmitting} // As per best practice, let the handler validate
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
  selectedProgramIdsLength: PropTypes.number.isRequired, // Used for potential visual cues (though not in disabled prop now)
  formData: PropTypes.shape({ // Added for final button disabling if needed
    email: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    confirmPassword: PropTypes.string.isRequired,
  }).isRequired,
};

export default FormNavigation;