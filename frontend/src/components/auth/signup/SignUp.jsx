// src/components/SignUp/SignUp.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";

import useEnrollmentAndPayment from "../../../hooks/useEnrollmentAndPayment";
import { usePrograms } from "../../../context/ProgramsContext";
import ProgramSelection from "./ProgramSelection";
import AccountDetailsForm from "./AccountDetailsForm";
import FormNavigation from "./FormNavigation";
import AuthLayout from "../../layouts/auth/AuthLayout";
import styles from "./SignUp.module.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { programType } = useParams(); // programType from route path param
  const accountDetailsFormRef = useRef();

  // --- Get programs and allCourses data from the context ---
  const {
    programs: fetchedPrograms, // Renamed for clarity to avoid conflict with local 'programs' if any
    allCourses,               // <-- Added this to get all courses from context
    loadingPrograms,
    programsError,
    refetchPrograms,
  } = usePrograms();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProgramIds, setSelectedProgramIds] = useState([]); // Stores programId (e.g., "25000e08...")
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

  // --- Process initial program selection from URL ---
  useEffect(() => {
    // Only process if data has loaded successfully
    if (!loadingPrograms && !programsError && fetchedPrograms.length > 0) {
      const programIdFromUrl = searchParams.get("programId");
      // Prioritize path param, then search param for initial program ID
      const initialProgramIdentifier = programType || programIdFromUrl;

      if (initialProgramIdentifier) {
        // Use 'programId' from the fetched program object for validation
        const isValidProgram = fetchedPrograms.some(p => p.programId === initialProgramIdentifier);
        if (isValidProgram) {
          if (!selectedProgramIds.includes(initialProgramIdentifier)) {
            setSelectedProgramIds([initialProgramIdentifier]); // Enforce single selection
          }
          if (currentStep !== 2) {
            setCurrentStep(2); // Move to account details if program pre-selected
          }
        } else {
          setGlobalError("The program you selected from the URL is not available. Please choose from the list below.");
          if (currentStep !== 1) {
            setCurrentStep(1); // Revert to program selection if invalid ID
          }
        }
      } else {
        // If no program ID in URL, default to step 1
        if (currentStep !== 1) {
          setCurrentStep(1);
        }
      }
    } else if (!loadingPrograms && !programsError && fetchedPrograms.length === 0) {
      // Handle case where no programs are available after loading
      setGlobalError("No programs are currently available for enrollment. Please check back later.");
      if (currentStep !== 1) {
        setCurrentStep(1);
      }
    }
  }, [programType, searchParams, selectedProgramIds, currentStep, fetchedPrograms, loadingPrograms, programsError]);

  // --- Prepare programs data with their included courses for ProgramSelection component ---
  const programsWithCourses = useMemo(() => {
    if (!fetchedPrograms || fetchedPrograms.length === 0 || !allCourses || allCourses.length === 0) {
      return [];
    }

    return fetchedPrograms.map(program => {
      const includedCourses = allCourses.filter(course =>
        // Match course's programIds array with the current program's programId
        course.programIds && Array.isArray(course.programIds) && course.programIds.includes(program.programId)
      );
      return {
        ...program,
        // Add the filtered courses array to each program object
        courses: includedCourses 
      };
    });
  }, [fetchedPrograms, allCourses]); // Recalculate if fetchedPrograms or allCourses change

  // --- Calculate total price for selected programs ---
  const totalPrice = useMemo(
    () =>
      selectedProgramIds.reduce((total, id) => {
        // Find the program using its programId, not 'id'
        const program = fetchedPrograms.find((p) => p.programId === id);
        // Use 'program.price' as per your data structure
        return total + (program?.price || 0); 
      }, 0),
    [selectedProgramIds, fetchedPrograms]
  );

  // --- Handlers ---
  const handleProgramSelection = useCallback((programId) => {
    setSelectedProgramIds((prev) =>
      // Enforce single selection by always replacing the array
      prev.includes(programId) ? [] : [programId] 
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
        if (loadingPrograms) {
          setGlobalError("Please wait, programs are still loading.");
          return;
        }
        if (programsError) {
          setGlobalError(`Cannot proceed due to a program loading error: ${programsError}`);
          return;
        }
        if (selectedProgramIds.length === 0) {
          setGlobalError("Please select a program module to proceed."); // Changed "at least one" to "a" for single selection
          return;
        }
        setCurrentStep(2);
      }
    },
    [currentStep, selectedProgramIds, loadingPrograms, programsError]
  );

  const handlePreviousStep = useCallback(() => {
    setGlobalError("");
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (programType) { // If initially came from a specific program URL
      navigate("/"); // Navigate home if on step 1 with pre-selected program
    } else {
      setCurrentStep(1); // Stay on step 1 if no pre-selected program
    }
  }, [currentStep, programType, navigate]);

  const handleSubmitAccountDetails = useCallback(async () => {
    setGlobalError("");

    // Trigger validation on the AccountDetailsForm component
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

    // Assuming initiatePayment expects the programId for enrollment
    const enrollmentDetails = {
      programId: selectedProgramIds[0], // Pass the ID of the selected program
    };

    try {
      await initiatePayment({ customerDetails, enrollmentDetails });
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
  if (loadingPrograms) {
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
            programs={programsWithCourses} // Pass the enriched programs array
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