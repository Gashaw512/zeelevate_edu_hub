import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// Import your new sub-components
import ProgramSelection from "./ProgramSelection";
import AccountDetailsForm from "./AccountDetailsForm";
import FormNavigation from "./FormNavigation";

// Existing common components and utilities
import AuthLayout from "../../layouts/auth/AuthLayout";
import SocialAuthButtons from "../../common/SocialAuthButton";
import { getAllProviders } from "../../../data/externalAuthProviderConfig"; // Ensure this path is correct

// Ensure your CSS path is correct
import "./SignUp.css";

// ---
// Mock PROGRAM data remains here as it's directly tied to the SignUp logic
// ---
const MOCK_PROGRAMS = [
  {
    id: 'teen-programs',
    name: 'Teen Programs',
    shortDescription: 'Designed for young learners, covering foundational skills.',
    fixedPrice: 150.00,
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
    fixedPrice: 280.00,
    courses: [
      { id: 'adult-financial-lit', name: 'Financial Literacy for Adults' },
      { id: 'adult-college-prep', name: 'Career & College Readiness' },
      { id: 'adult-excel', name: 'Excel for Professionals' },
      { id: 'adult-web-dev', name: 'Web Development Bootcamp' },
    ],
  },
];

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const externalProviders = getAllProviders();

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
        // Ensure that if a programId is passed, only that one is selected initially.
        // If you want to allow multiple, adjust this logic.
        setSelectedProgramIds([programIdFromUrl]);
      }
    }
  }, [searchParams, selectedProgramIds]); // Depend on selectedProgramIds to prevent re-adding if already present

  const calculateTotalPrice = useCallback(() => {
    let total = 0;
    MOCK_PROGRAMS.forEach(program => {
      if (selectedProgramIds.includes(program.id)) {
        total += program.fixedPrice;
      }
    });
    return total;
  }, [selectedProgramIds]);

  const handleProgramSelection = useCallback((programId) => {
    setSelectedProgramIds(prev =>
      prev.includes(programId)
        ? prev.filter(id => id !== programId)
        : [programId] // Allows only single selection if you want, or prev.concat(programId) for multiple
    );
    setError(''); // Clear error on selection change
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
  }, [error]);

  const handleNextStep = useCallback((e) => {
    e.preventDefault();
    setError('');

    if (currentStep === 1) {
      if (selectedProgramIds.length === 0) {
        setError('Please select at least one program module to proceed.');
        return;
      }
      setCurrentStep(2);
    }
  }, [currentStep, selectedProgramIds]);

  const handlePreviousStep = useCallback(() => {
    setError(''); // Clear any errors when going back
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  const handleSubmitFinalDetails = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Basic client-side validation for account details
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required personal details.');
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    // Email validation (simple regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    // Password strength (example: min 8 chars)
    if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setIsSubmitting(false);
        return;
    }

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

    // Simulate API call for registration/enrollment
    console.log("Submitting form data:", {
      formData,
      selectedPrograms: selectedProgramIds,
      coursesToEnroll,
      totalPrice: calculateTotalPrice(),
    });

    // In a real application, you would make an API call here.
    // For example:
    /*
    try {
      const response = await api.post('/register-enroll', {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        selectedProgramIds,
        coursesToEnroll,
        totalPrice: calculateTotalPrice(),
      });
      if (response.data.success) {
        navigate('/checkout', {
          state: {
            formData,
            selectedPrograms: selectedProgramIds,
            coursesToEnroll,
            totalPrice: calculateTotalPrice(),
          },
        });
      } else {
        setError(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (apiError) {
      console.error("Registration API error:", apiError);
      setError(apiError.response?.data?.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
    */

    // For now, directly navigate to checkout on successful client-side validation
    setTimeout(() => { // Simulate network delay
        navigate('/checkout', {
            state: {
                formData,
                selectedPrograms: selectedProgramIds,
                coursesToEnroll,
                totalPrice: calculateTotalPrice(),
            },
        });
        setIsSubmitting(false);
    }, 1000);


  }, [formData, selectedProgramIds, calculateTotalPrice, navigate]);

  const handleSocialAuthIntent = useCallback((providerName) => {
    // This is a placeholder. In a payment-first flow, social sign-in
    // typically needs backend coordination to handle user registration
    // and then linking to a payment intent without immediate pre-payment registration.
    console.log(`Attempting social sign-in with: ${providerName}`);
    setError("For payment-first flow, social sign-in requires specific backend integration to manage pre-payment user association.");
  }, []);

  return (
    <AuthLayout
      title="Enroll in Programs" // Maps to .auth-title in AuthLayout
      instruction={currentStep === 1 ? "Select your program modules." : "Provide your details to begin your learning journey."} // Maps to .auth-instruction
    >
      <form onSubmit={currentStep === 2 ? handleSubmitFinalDetails : handleNextStep} className="enrollment-form">
        {currentStep === 1 && (
          <ProgramSelection
            programs={MOCK_PROGRAMS}
            selectedProgramIds={selectedProgramIds}
            onProgramSelect={handleProgramSelection}
            calculateTotalPrice={calculateTotalPrice}
          />
        )}

        {currentStep === 2 && (
          <AccountDetailsForm
            formData={formData}
            onFormChange={handleChange}
          />
        )}

        {error && <p className="error-message">{error}</p>}

        <FormNavigation
          currentStep={currentStep}
          isSubmitting={isSubmitting}
          onPreviousStep={handlePreviousStep}
          selectedProgramIdsLength={selectedProgramIds.length}
          formData={formData} // Pass formData for validation checks within FormNavigation
        />
      </form>

      <p className="sign-up-prompt"> {/* Apply new class name */}
        Already have an account?{" "}
        <a href="/signin" className="link primary-link"> {/* Apply consistent link classes */}
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