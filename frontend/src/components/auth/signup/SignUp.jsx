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
        setSelectedProgramIds([programIdFromUrl]);
      }
    }
  }, [searchParams, selectedProgramIds]);

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
        : [programId]
    );
    setError('');
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
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
    setError('');
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  const handleSubmitFinalDetails = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

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

    navigate('/checkout', {
      state: {
        formData,
        selectedPrograms: selectedProgramIds,
        coursesToEnroll,
        totalPrice: calculateTotalPrice(),
      },
    });

    setIsSubmitting(false);
  }, [formData, selectedProgramIds, calculateTotalPrice, navigate]);

  const handleSocialAuthIntent = useCallback((providerName) => {
    setError("For payment-first flow, social sign-in needs backend coordination to avoid pre-payment registration.");
  }, []);

  return (
    <AuthLayout
      title="Enroll in Programs"
      instruction={currentStep === 1 ? "Select your program modules." : "Provide your details to begin your learning journey."}
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