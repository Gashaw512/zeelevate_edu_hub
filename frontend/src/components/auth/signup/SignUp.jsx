// SignUp.jsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import useEnrollmentAndPayment from "../../../hooks/useEnrollmentAndPayment";
import ProgramSelection from "./ProgramSelection";
import AccountDetailsForm from "./AccountDetailsForm";
import FormNavigation from "./FormNavigation";
import AuthLayout from "../../layouts/auth/AuthLayout";
import SocialAuthButtons from "../../common/SocialAuthButton";
import { getAllProviders } from "../../../data/externalAuthProviderConfig";
import styles from "./SignUp.module.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { programType } = useParams();
  const externalProviders = getAllProviders();
  const accountDetailsFormRef = useRef();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProgramIds, setSelectedProgramIds] = useState([]);
  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [globalError, setGlobalError] = useState("");

  // States for fetching programs
  const [fetchedPrograms, setFetchedPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState(null);

  // Payment hook
  const {
    initiatePayment,
    isLoading: paymentLoading,
    error: paymentError,
  } = useEnrollmentAndPayment();

  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL;

  // --- useEffect to fetch program data from backend ---
  useEffect(() => {
    const fetchProgramsData = async () => {
      try {
        setProgramsLoading(true);
        setProgramsError(null);

        const response = await fetch(`${BACKEND_API_URL}/api/admin/public/courses`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error format' }));
          throw new Error(errorData.message || `Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        const coursesArray = data.courses || [];

        const transformedData = coursesArray.map(course => ({
          id: course.courseId,
          name: course.courseTitle,
          shortDescription: course.courseDetails,
          fixedPrice: course.price || 0,
          courses: [{ id: course.courseId, name: course.courseTitle }],
        }));

        setFetchedPrograms(transformedData);

      } catch (err) {
        console.error('Error fetching programs for SignUp:', err);
        setProgramsError(`Failed to load program options: ${err.message}.`);
      } finally {
        setProgramsLoading(false);
      }
    };

    fetchProgramsData();
  }, [BACKEND_API_URL]);


  // --- Program selection from URL / Default Step ---
  useEffect(() => {
    // Only process this if programs data has finished loading and there are no errors
    if (!programsLoading && !programsError) {
        const programIdFromUrl = searchParams.get("programId");
        let initialProgramId = null;

        if (programType) {
            initialProgramId = programType;
        } else if (programIdFromUrl) {
            initialProgramId = programIdFromUrl;
        }

        // Only update if an initialProgramId is present and not already selected
        // AND if it exists in the fetched programs
        if (initialProgramId && !selectedProgramIds.includes(initialProgramId)) {
            const isValidProgram = fetchedPrograms.some(p => p.id === initialProgramId);
            if (isValidProgram) {
                setSelectedProgramIds([initialProgramId]);
                setCurrentStep(2); // Jump directly to Account Details (Step 2)
            } else {
                setGlobalError("Invalid program ID in URL. Please select a program manually.");
                setCurrentStep(1); // Fallback to step 1 if URL ID is invalid
            }
        } else if (!initialProgramId && currentStep !== 1) {
            // If no initial program ID in URL and we are not already at step 1,
            // force to step 1 for interactive selection.
            setCurrentStep(1);
        }
    }
    // Dependencies: Ensure effect runs when these values change
  }, [programType, searchParams, selectedProgramIds, currentStep, fetchedPrograms, programsLoading, programsError]);


  // Total Price calculator
  const totalPrice = useMemo(
    () =>
      selectedProgramIds.reduce((total, id) => {
        const program = fetchedPrograms.find((p) => p.id === id);
        return total + (program?.fixedPrice || 0);
      }, 0),
    [selectedProgramIds, fetchedPrograms]
  );

  // Handlers
  const handleProgramSelection = useCallback((programId) => {
    setSelectedProgramIds((prev) =>
      prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [programId] // Allows single selection
    );
    setGlobalError("");
  }, []);

  const handleChange = useCallback(({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setGlobalError("");
  }, []);

  const handleNextStep = useCallback(
    (e) => {
      e.preventDefault();
      setGlobalError("");

      if (currentStep === 1) {
        // Prevent proceeding if programs are still loading or there's an error
        if (programsLoading || programsError) {
          setGlobalError("Please wait for program options to load.");
          return;
        }
        // Only allow next if at least one program is selected
        if (selectedProgramIds.length === 0) {
          setGlobalError("Please select at least one program module to proceed.");
          return;
        }
        setCurrentStep(2);
      }
    },
    [currentStep, selectedProgramIds, programsLoading, programsError] // Added dependencies
  );

  const handlePreviousStep = useCallback(() => {
    setGlobalError("");
    if (programType) {
      navigate("/");
    } else {
      setCurrentStep(1);
    }
  }, [programType, navigate]);

  const handleSubmitAccountDetails = useCallback(async () => {
    setGlobalError("");

    const isValid = accountDetailsFormRef.current?.triggerFormValidation();
    if (!isValid) return;

    if (selectedProgramIds.length === 0) {
      setGlobalError("No course selected for enrollment. Please go back and select a course.");
      return;
    }

    const customerDetails = {
      firstName: formData.fName,
      lastName: formData.lName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
    };

    const courseDetails = {
      courseId: selectedProgramIds[0],
    };

    try {
      await initiatePayment({ customerDetails, courseDetails });
    } catch (err) {
      console.error("Payment initiation error:", err);
      setGlobalError(err.message || "Failed to initiate payment. Please try again.");
    }
  }, [formData, selectedProgramIds, initiatePayment]);

  const handleSocialAuthIntent = useCallback((providerName) => {
    setGlobalError(
      `${providerName} registration requires payment-first flow. Please use email/password or contact support.`
    );
  }, []);

  const layoutTitle = currentStep === 1 ? "Enroll in Programs" : "Account Details";
  const layoutInstruction =
    currentStep === 1
      ? "Select the program modules that best fit your learning goals."
      : "Provide your personal and account details to complete your enrollment.";

  const isLayoutWide = currentStep === 1;

  // --- Render Loading/Error states for programs data, displayed on step 1 ---
  if (programsLoading) {
    return (
      <AuthLayout
        title="Loading Programs..."
        instruction="Fetching available programs. Please wait."
        isWide={true}
      >
        <div className={styles.loadingMessage}>Loading program options...</div>
      </AuthLayout>
    );
  }

  if (programsError) {
    return (
      <AuthLayout
        title="Error Loading Programs"
        instruction="Could not fetch program options."
        isWide={true}
      >
        <div className={styles.errorMessage}>{programsError}</div>
        <p className={styles.errorMessage}>Please try refreshing the page.</p>
      </AuthLayout>
    );
  }

  // If no programs are fetched and there's no error, display a message.
  if (!programsLoading && !programsError && fetchedPrograms.length === 0) {
    return (
      <AuthLayout
        title="No Programs Available"
        instruction="Currently, there are no programs to display for enrollment."
        isWide={true}
      >
        <p className={styles.errorMessage}>Please check back later.</p>
      </AuthLayout>
    );
  }


  return (
    <AuthLayout
      title={layoutTitle}
      instruction={layoutInstruction}
      isWide={isLayoutWide}
      navLinkTo="/signin"
      navLinkLabel="Already have an account? Sign In"
    >
      <form
        onSubmit={(e) => e.preventDefault()}
        className={styles.enrollmentForm}
      >
        {currentStep === 1 && (
          <ProgramSelection
            programs={fetchedPrograms}
            selectedProgramIds={selectedProgramIds}
            onProgramSelect={handleProgramSelection}
            totalPrice={totalPrice}
          />
        )}

        {currentStep === 2 && (
          <AccountDetailsForm
            ref={accountDetailsFormRef}
            formData={formData}
            onFormChange={handleChange}
            isLoading={paymentLoading}
          />
        )}

        {globalError && <p className={styles.errorMessage}>{globalError}</p>}
        <FormNavigation
          currentStep={currentStep}
          isSubmitting={paymentLoading}
          onPreviousStep={handlePreviousStep}
          onNextStep={handleNextStep}
          onFinalSubmit={handleSubmitAccountDetails}
          // Disable "Next" button if programs are loading or selectedPrograms are empty on step 1
          isNextDisabled={currentStep === 1 && (programsLoading || selectedProgramIds.length === 0)}
          selectedProgramIdsLength={selectedProgramIds.length}
        />
      </form>

      <p className={styles.signUpPrompt}>
        Already have an account?{" "}
        <Link to="/signin" className={styles.link}>
          Sign In
        </Link>
      </p>

      <div className={styles.divider}>
        <span className={styles.dividerText}>OR</span>
      </div>

      {/* <SocialAuthButtons
        providers={externalProviders}
        onSignIn={handleSocialAuthIntent}
      /> */}
    </AuthLayout>
  );
};

export default SignUp;