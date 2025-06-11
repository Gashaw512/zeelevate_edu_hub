import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";

import useEnrollmentAndPayment from "../../../hooks/useEnrollmentAndPayment";
import { usePrograms } from "../../../context/ProgramsContext"; // New import for the context hook
import ProgramSelection from "./ProgramSelection";
import AccountDetailsForm from "./AccountDetailsForm";
import FormNavigation from "./FormNavigation";
import AuthLayout from "../../layouts/auth/AuthLayout";
import styles from "./SignUp.module.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { programType } = useParams();
  const accountDetailsFormRef = useRef();

  // --- Get programs data from the context ---
  const {
    programs: fetchedPrograms, // Renamed to fetchedPrograms for clarity as used in component
    loadingPrograms,          // Use the renamed prop from context
    programsError,            // Use the renamed prop from context
    refetchPrograms,          // If you need to trigger a re-fetch, use this
  } = usePrograms();

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

  const {
    initiatePayment,
    isLoading: paymentLoading,
    error: paymentError,
  } = useEnrollmentAndPayment();

  useEffect(() => {
    if (paymentError) {
      setGlobalError(paymentError.message || "An unexpected payment error occurred.");
    }
  }, [paymentError]);

  // In SignUp.jsx
  useEffect(() => {
    // Only process this if programs data has finished loading and there are no errors
    if (!loadingPrograms && !programsError && fetchedPrograms.length > 0) {
      const programIdFromUrl = searchParams.get("programId");
      let initialProgramId = programType || programIdFromUrl;

      if (initialProgramId) {
        const isValidProgram = fetchedPrograms.some(p => p.id === initialProgramId);
        if (isValidProgram) {
          if (!selectedProgramIds.includes(initialProgramId)) {
            setSelectedProgramIds([initialProgramId]);
          }
          if (currentStep !== 2) {
            setCurrentStep(2);
          }
        } else {
          setGlobalError("The program you selected from the URL is not available. Please choose from the list below.");
          if (currentStep !== 1) {
            setCurrentStep(1);
          }
        }
      } else {
        if (currentStep !== 1 && currentStep !== 2) {
          setCurrentStep(1);
        }
      }
    } else if (!loadingPrograms && !programsError && fetchedPrograms.length === 0) {
      setGlobalError("No programs are currently available for enrollment. Please check back later.");
      if (currentStep !== 1) {
        setCurrentStep(1);
      }
    }
    // No changes to dependencies needed here.
    // Dependencies remain the same as the data they depend on are now coming from context,
    // which has its own memoization logic.
  }, [programType, searchParams, selectedProgramIds, currentStep, fetchedPrograms, loadingPrograms, programsError]);


  const totalPrice = useMemo(
    () =>
      selectedProgramIds.reduce((total, id) => {
        const program = fetchedPrograms.find((p) => p.id === id);
        return total + (program?.fixedPrice || 0);
      }, 0),
    [selectedProgramIds, fetchedPrograms]
  );

  // --- Handlers ---
  const handleProgramSelection = useCallback((programId) => {
    setSelectedProgramIds((prev) =>
      prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [programId] // Enforce single selection
    );
    setGlobalError(""); // Clear any previous errors on selection change
  }, []);

  const handleChange = useCallback(({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setGlobalError(""); // Clear global error on form input change
  }, []);

  const handleNextStep = useCallback(
    (e) => {
      e.preventDefault();
      setGlobalError("");

      if (currentStep === 1) {
        if (loadingPrograms) { // Use loadingPrograms from context
          setGlobalError("Please wait, programs are still loading.");
          return;
        }
        if (programsError) { // Use programsError from context
          setGlobalError(`Cannot proceed due to a program loading error: ${programsError}`);
          return;
        }
        if (selectedProgramIds.length === 0) {
          setGlobalError("Please select at least one program module to proceed.");
          return;
        }
        setCurrentStep(2);
      }
    },
    [currentStep, selectedProgramIds, loadingPrograms, programsError] // Updated dependencies
  );

  const handlePreviousStep = useCallback(() => {
    setGlobalError("");
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (programType) {
      navigate("/");
    } else {
      setCurrentStep(1);
    }
  }, [currentStep, programType, navigate]);

  const handleSubmitAccountDetails = useCallback(async () => {
    setGlobalError("");

    const isValid = accountDetailsFormRef.current?.triggerFormValidation();
    if (!isValid) {
      setGlobalError("Please correct the errors in your account details.");
      return;
    }

    if (selectedProgramIds.length === 0) {
      setGlobalError("No program selected for enrollment. Please go back to Step 1 and select a program.");
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
      console.error("Payment initiation failed:", err);
      setGlobalError(err.message || "Failed to initiate payment. Please review your details and try again.");
    }
  }, [formData, selectedProgramIds, initiatePayment]);


  // --- Layout Props Calculation ---
  const layoutTitle = useMemo(() =>
    currentStep === 1 ? "Choose Your Program Modules" : "Your Account Details",
    [currentStep]
  );

  const layoutInstruction = useMemo(() =>
    currentStep === 1
      ? "Please select the programs that best fit your learning goals."
      : "Please provide your personal and account information to complete your enrollment.",
    [currentStep]
  );

  const isLayoutWide = useMemo(() => currentStep === 1, [currentStep]);

  // --- Conditional Rendering for Loading/Error/No Programs ---
  if (loadingPrograms) { // Use loadingPrograms from context
    return (
      <AuthLayout
        title="Loading Programs..."
        instruction="Fetching available program options. Please wait a moment."
        isWide={true}
      >
        <div className={styles.loadingMessage}>Loading program options...</div>
      </AuthLayout>
    );
  }

  if (programsError) { // Use programsError from context
    return (
      <AuthLayout
        title="Error Loading Programs"
        instruction="We encountered an issue fetching program options. Please try refreshing the page."
        isWide={true}
      >
        <div className={styles.errorMessage}>{programsError}</div>
        <button onClick={refetchPrograms} className={styles.retryButton}>
          Retry Loading Programs
        </button>
      </AuthLayout>
    );
  }

  // If loading is complete and no errors, but no programs were fetched
  if (fetchedPrograms.length === 0) {
    return (
      <AuthLayout
        title="No Programs Available"
        instruction="Currently, there are no programs available for enrollment. Please check back later."
        isWide={true}
      >
        <p className={styles.infoMessage}>We are working to add new programs soon!</p>
      </AuthLayout>
    );
  }

  // --- Main Component Render ---
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
          selectedProgramIdsLength={selectedProgramIds.length}
        />
      </form>
    </AuthLayout>
  );
};

export default SignUp;