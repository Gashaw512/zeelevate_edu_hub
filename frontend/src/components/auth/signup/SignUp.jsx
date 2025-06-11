import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";

import useEnrollmentAndPayment from "../../../hooks/useEnrollmentAndPayment";
import useProgramsFetcher from "../../../hooks/useProgramsFetcher"; 
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

  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL;

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
    programs: fetchedPrograms,
    loading: programsLoading,
    error: programsError,
    refetchPrograms, 
  } = useProgramsFetcher(BACKEND_API_URL);

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
  if (!programsLoading && !programsError && fetchedPrograms.length > 0) {
    const programIdFromUrl = searchParams.get("programId");
    let initialProgramId = programType || programIdFromUrl;

    if (initialProgramId) {
      const isValidProgram = fetchedPrograms.some(p => p.id === initialProgramId);
      if (isValidProgram) {
        // Ensure the program is selected before potentially moving to step 2
        if (!selectedProgramIds.includes(initialProgramId)) {
          setSelectedProgramIds([initialProgramId]);
        }
        // Only set currentStep to 2 if it's not already 2 (to prevent unnecessary re-renders)
        // AND if we are trying to initialize from a URL.
        if (currentStep !== 2) { // Prevents infinite loop if already at step 2
            setCurrentStep(2);
        }
      } else {
        setGlobalError("The program you selected from the URL is not available. Please choose from the list below.");
        // If an invalid program ID is in URL, ensure we are at step 1 for selection
        if (currentStep !== 1) {
          setCurrentStep(1);
        }
      }
    } else {
      // If no initial program ID in URL and we are not already at step 1,
      // force to step 1 for interactive selection.
      // IMPORTANT: Only set to 1 if we're not already explicitly at step 2 (e.g., from a manual "Next" click)
      if (currentStep !== 1 && currentStep !== 2) { // <--- MODIFIED CONDITION HERE
         setCurrentStep(1);
      }
      // Alternatively, if you only want to force to step 1 on initial load and no URL param:
      // if (currentStep === 1 && selectedProgramIds.length === 0) {
      //   // Do nothing, already at step 1 and waiting for selection
      // } else if (currentStep !== 1 && selectedProgramIds.length === 0) {
      //   // If we somehow ended up at step 2 without a program selected, push back to 1
      //   setCurrentStep(1);
      // }
    }
  } else if (!programsLoading && !programsError && fetchedPrograms.length === 0) {
    // If loading is complete, no error, but no programs found, keep at step 1 and show message.
    setGlobalError("No programs are currently available for enrollment. Please check back later.");
    if (currentStep !== 1) { // Only set if not already 1
      setCurrentStep(1);
    }
  }
  // No changes to dependencies needed here.
}, [programType, searchParams, selectedProgramIds, currentStep, fetchedPrograms, programsLoading, programsError]);


 
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

// In "Robust/Customized" code
const handleNextStep = useCallback(
  (e) => {
    e.preventDefault();
    setGlobalError("");

    if (currentStep === 1) {
      if (programsLoading) { 
        setGlobalError("Please wait, programs are still loading.");
        return;
      }
      if (programsError) { 
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
  [currentStep, selectedProgramIds, programsLoading, programsError] 
);

  const handlePreviousStep = useCallback(() => {
    setGlobalError("");
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (programType) {
      // If programType is present, it means the user came from a specific program page,
      // so navigating back should go to the homepage or relevant landing page.
      navigate("/");
    } else {
      // Default to going back to step 1 if not coming from a programType URL
      setCurrentStep(1);
    }
  }, [currentStep, programType, navigate]);

  const handleSubmitAccountDetails = useCallback(async () => {
    setGlobalError("");

    // Trigger validation on the AccountDetailsForm component via ref
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

    // Assuming single program selection based on previous logic; adjust if multi-select is allowed
    const courseDetails = {
      courseId: selectedProgramIds[0],
    };

    try {
      await initiatePayment({ customerDetails, courseDetails });
      // Payment successful, navigate or show success message
      // navigate('/payment-success'); // Example
    } catch (err) {
      console.error("Payment initiation failed:", err);
      // The `paymentError` state from the hook will update and trigger the `useEffect` above.
      // However, it's good to also set globalError here for immediate feedback if `paymentError`
      // isn't propagating fast enough or you want custom messages.
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
  if (programsLoading) {
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

  if (programsError) {
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

        {/* Global error message display */}
        {globalError && <p className={styles.errorMessage}>{globalError}</p>}

        <FormNavigation
          currentStep={currentStep}
          isSubmitting={paymentLoading} // Use paymentLoading to disable buttons during payment
          onPreviousStep={handlePreviousStep}
          onNextStep={handleNextStep}
          onFinalSubmit={handleSubmitAccountDetails}
          // Disable "Next" button on step 1 if no program is selected or if programs are loading/errored
          // isNextDisabled={currentStep === 1 && (selectedProgramIds.length === 0 || programsLoading || programsError)}
          selectedProgramIdsLength={selectedProgramIds.length} // Prop for conditional rendering in FormNavigation
        />
      </form>
    </AuthLayout>
  );
};

export default SignUp;