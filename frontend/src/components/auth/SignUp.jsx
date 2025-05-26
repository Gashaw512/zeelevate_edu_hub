import { signInWithPopup } from "firebase/auth";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "../../firebase/auth"; // Ensure this path is correct
import AuthForm from "../common/AuthForm";
import AuthLayout from "../layouts/auth/AuthLayout";
import SocialAuthButtons from "../common/SocialAuthButton";
import useSignUp from "../../hooks/useSignUp"; // If useSignUp is not used, you can remove this import
import { getAllProviders } from "../../data/externalAuthProviderConfig"; // Ensure this path is correct
import "./SignUp.css"; // Ensure your CSS path is correct

// ---
// Mock PROGRAM data: Each top-level object is a program module with a FIXED PRICE.
// When a user selects a program, they get ALL courses within it for that fixed price.
// ---
const MOCK_PROGRAMS = [
  {
    id: 'teen-programs',
    name: 'Teen Programs',
    shortDescription: 'Designed for young learners, covering foundational skills.',
    fixedPrice: 150.00, // FIXED PRICE for the entire Teen Programs module
    courses: [
      { id: 'teen-python', name: 'Python for Teens' },
      { id: 'teen-digital-lit', name: 'Digital Citizenship for Youth' },
      { id: 'teen-coding-basics', name: 'Coding Basics for Kids' },
    ],
  },
  {
    id: 'adult-programs',
    name: 'Adult Programs',
    shortDescription: 'Advanced skills and career development for professionals.',
    fixedPrice: 280.00, // FIXED PRICE for the entire Adult Programs module
    courses: [
      { id: 'adult-financial-lit', name: 'Financial Literacy for Adults' },
      { id: 'adult-college-prep', name: 'Career & College Readiness' },
      { id: 'adult-excel', name: 'Excel for Professionals' },
      { id: 'adult-web-dev', name: 'Web Development Bootcamp' },
    ],
  },
];

/**
 * EnrollmentFlow Component (renamed to SignUp for consistency with file name)
 *
 * This component guides the user through program module selection,
 * captures initial user details (email, password, name, phone),
 * and then proceeds to the payment step.
 * It does NOT directly register the user in Firebase.
 */
const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const externalProviders = getAllProviders(); // Assuming this fetches providers correctly

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProgramIds, setSelectedProgramIds] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill logic using useEffect and useSearchParams
  useEffect(() => {
    const programIdFromUrl = searchParams.get('programId');
    if (programIdFromUrl) {
      const programExists = MOCK_PROGRAMS.some(p => p.id === programIdFromUrl);
      if (programExists && !selectedProgramIds.includes(programIdFromUrl)) {
        // Ensure only one program is selected, as per original logic for auto-fill
        setSelectedProgramIds([programIdFromUrl]);
      }
    }
  }, [searchParams, selectedProgramIds]);

  const enrollmentFieldsConfig = [
    { name: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', required: true },
    { name: 'phoneNumber', label: 'Phone Number', type: 'tel', placeholder: 'e.g., +1234567890', required: true },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', required: true },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••', required: true },
  ];

  // Calculate the total price based on selected program modules' fixedPrice
  const calculateTotalPrice = useCallback(() => {
    let total = 0;
    MOCK_PROGRAMS.forEach(program => {
      if (selectedProgramIds.includes(program.id)) {
        total += program.fixedPrice;
      }
    });
    return total;
  }, [selectedProgramIds]);

  // Handler for selecting an entire program module (single-selection behavior)
  const handleProgramSelection = useCallback((programId) => {
    // This logic ensures only one program can be selected at a time,
    // which aligns with the "single-selection behavior" comment.
    // If you intend for multiple selections, this logic needs adjustment.
    setSelectedProgramIds(prev =>
      prev.includes(programId)
        ? prev.filter(id => id !== programId) // Deselect if already selected
        : [programId] // Select only the new program, deselecting others
    );
    setError(''); // Clear error on selection change
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user types
  }, [error]);

  // Function to handle advancing to the next step
  const handleNextStep = useCallback((e) => {
    e.preventDefault(); // Prevent full form submission
    setError(''); // Clear previous errors

    if (currentStep === 1) {
      if (selectedProgramIds.length === 0) {
        setError('Please select at least one program module to proceed.');
        return; // Stop if no program is selected
      }
      setCurrentStep(2); // Advance to Account Details
    }
    // Add more step validations here if you add more steps
  }, [currentStep, selectedProgramIds]);

  // Function to handle going back to the previous step
  const handlePreviousStep = useCallback(() => {
    setError(''); // Clear error when going back
    setCurrentStep(prev => Math.max(1, prev - 1)); // Go back, but not below step 1
  }, []);

  // This now only handles the FINAL submission (when on the last step)
  const handleSubmitFinalDetails = useCallback(async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsSubmitting(true);

    // Validate formData for step 2 (Account Details)
    // All required fields must be filled
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required personal details.');
      setIsSubmitting(false);
      return;
    }

    // Passwords must match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    // Prepare courses to enroll for backend (flatten all courses from selected programs)
    const coursesToEnroll = [];
    MOCK_PROGRAMS.forEach(program => {
      if (selectedProgramIds.includes(program.id)) {
        coursesToEnroll.push(...program.courses.map(course => ({
          id: course.id,
          name: course.name,
          programId: program.id,
          programName: program.name
        })));
      }
    });

    // Navigate to Checkout with all collected data
    navigate('/checkout', {
      state: {
        formData,
        selectedPrograms: selectedProgramIds,
        coursesToEnroll,
        totalPrice: calculateTotalPrice(),
      },
    });

    setIsSubmitting(false); // In a real app, this would be set to false after successful navigation/API call
  }, [formData, selectedProgramIds, calculateTotalPrice, navigate]);

  const handleSocialAuthIntent = useCallback((providerName) => {
    // In a real-world scenario, you'd likely want to associate social sign-ins
    // with program selections and handle payment after auth.
    // For this example, we're explicitly preventing it to guide the user through the form.
    setError("For payment-first flow, social sign-in needs backend coordination to avoid pre-payment registration.");
    // setIsSubmitting(false); // No need to set isSubmitting to false as it wasn't set to true
  }, []);

  return (
    <AuthLayout
      title="Enroll in Programs"
      instruction={currentStep === 1 ? "Select your program modules." : "Provide your details to begin your learning journey."}
    >
      <form onSubmit={currentStep === 2 ? handleSubmitFinalDetails : handleNextStep} className="enrollment-form">
        {/* --- Step 1: Program Selection Section --- */}
        {currentStep === 1 && (
          <div className="course-selection-section">
            <h3>1. Choose Your Program Modules</h3>

            {MOCK_PROGRAMS.map(program => (
              <div
                key={program.id}
                className={`program-card ${selectedProgramIds.includes(program.id) ? 'selected' : ''}`}
                onClick={() => handleProgramSelection(program.id)}
              >
                <div className="program-header-selection">
                  <input
                    type="checkbox"
                    id={program.id}
                    checked={selectedProgramIds.includes(program.id)}
                    onChange={() => handleProgramSelection(program.id)}
                    // Stop propagation to prevent onClick on parent from firing twice
                    onClick={(e) => e.stopPropagation()}
                  />
                  <label htmlFor={program.id} className="program-title-label">
                    <h4>{program.name}</h4>
                  </label>
                </div>
                <p className="program-short-description">{program.shortDescription}</p>

                <div className="program-card-footer">
                  <span className="program-price-label">Price: ${program.fixedPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}
            <p className="total-price">Total Enrollment Cost: ${calculateTotalPrice().toFixed(2)}</p>

            {/* Single "View All Courses" link for the entire application */}
            <div className="view-all-courses-container">
              <p>Curious about what each program includes?</p>
              <a href="/courses" className="view-all-courses-link">
                View All Courses & Details
              </a>
            </div>
          </div>
        )}

        {/* --- Step 2: Account Details Section --- */}
        {currentStep === 2 && (
          <div className="initial-details-section">
            <h3>2. Your Account Details</h3>
            <AuthForm
              formData={formData}
              onChange={handleChange}
              fieldsConfig={enrollmentFieldsConfig}
              // AuthForm should ideally not have an onSubmit prop if the parent form handles it.
              // If AuthForm has its own internal submit, it needs to be prevented from bubbling up.
              // For now, assuming AuthForm is just for rendering fields.
            />
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        {/* --- Navigation Buttons --- */}
        <div className="form-navigation-buttons">
          {currentStep > 1 && (
            <button
              type="button" // Use type="button" to prevent accidental form submission
              className="button secondary-button back-button"
              onClick={handlePreviousStep}
            >
              Back
            </button>
          )}

          {currentStep < 2 && ( // Adjust '2' if you add more steps
            <button
              type="submit" // This button will now call handleNextStep
              className="button primary-button next-button"
              disabled={isSubmitting} // ONLY disable if currently submitting
            >
              Next
            </button>
          )}

          {currentStep === 2 && ( // This button only appears on the last step
            <button
              type="submit" // This button calls handleSubmitFinalDetails
              className="button primary-button submit-enrollment-button"
              disabled={isSubmitting} // ONLY disable if currently submitting
            >
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </button>
          )}
        </div>
      </form>

      {/* Social Auth and Sign In Link (can be outside the form, or inside step 2) */}
      <p className="sign-up">
        Already have an account?{" "}
        <a href="/signin" className="link">
          Sign In
        </a>
      </p>

      <div className="divider">
        <span className="divider-text">OR</span>
      </div>
      <SocialAuthButtons
        providers={externalProviders}
        onSignIn={handleSocialAuthIntent}
      />
    </AuthLayout>
  );
};

export default SignUp;