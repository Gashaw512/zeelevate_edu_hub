import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";

// Custom Hooks
import useEnrollmentAndPayment from "../../../hooks/useEnrollmentAndPayment";
import { usePrograms } from "../../../context/ProgramsContext"; // Centralized program data context

// Child Components
import ProgramSelection from "./ProgramSelection";
import AccountDetailsForm from "./AccountDetailsForm";
import FormNavigation from "./FormNavigation";

// Layout Component
import AuthLayout from "../../layouts/auth/AuthLayout";

// Styles
import styles from "./SignUp.module.css";

/**
 * SignUp Component
 * Manages the multi-step signup and program enrollment process.
 * Handles program selection, account details input, and payment initiation.
 */
const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Extracts 'programType' (e.g., 'bootcamp', 'course') from the URL path.
  const { programType } = useParams();
  // Ref to directly interact with the AccountDetailsForm component (e.g., for validation).
  const accountDetailsFormRef = useRef();

  // --- Global State from ProgramsContext ---
  // Fetches available programs and courses, along with their loading/error states.
  const {
    programs: fetchedPrograms, // Renamed 'programs' from context for clarity (to avoid state variable name collision)
    allCourses,                // All courses available, used to enrich program data
    loadingPrograms,           // Boolean indicating if program data is currently loading
    programsError,             // String/Error object if there was an error fetching programs
    refetchPrograms,           // Function to re-trigger program data fetch
  } = usePrograms();

  // --- Local Component State ---
  const [currentStep, setCurrentStep] = useState(1); // Controls the current step of the multi-step form
  // Stores the ID(s) of programs selected by the user. Designed for single selection.
  const [selectedProgramIds, setSelectedProgramIds] = useState([]);
  // Stores user input for account creation.
  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [globalError, setGlobalError] = useState(""); // General error message displayed to the user

  // --- Payment Processing State from Custom Hook ---
  const {
    initiatePayment,         // Function to begin the payment process
    isLoading: paymentLoading, // Boolean indicating if payment is in progress
    error: paymentError,     // Error object if payment fails
  } = useEnrollmentAndPayment();

  /**
   * Effect to handle and display any errors from the payment initiation process.
   * Clears existing global errors if payment error is resolved.
   */
  useEffect(() => {
    if (paymentError) {
      setGlobalError(paymentError.message || "An unexpected payment error occurred. Please try again.");
    } else {
      // Clear payment-related error if it's no longer present (e.g., on retry)
      setGlobalError(prev => prev === (paymentError?.message || "An unexpected payment error occurred. Please try again.") ? "" : prev);
    }
  }, [paymentError]);

  /**
   * Effect to initialize the form step and program selection based on URL parameters.
   * Runs on component mount and when URL or program data changes.
   * This is crucial for direct links to specific programs.
   */
  useEffect(() => {
    // Only proceed if programs are no longer loading and there are no loading errors.
    if (!loadingPrograms && !programsError) {
      const programIdFromUrl = searchParams.get("programId");
      // Prioritize path parameter (e.g., /signup/abc) over query parameter (e.g., /signup?programId=abc)
      const initialProgramIdentifier = programType || programIdFromUrl;

      // Log for debugging initial URL-based program ID detection.
      console.log(`[SignUp] Initializing: Program ID from URL path: ${programType}, from query: ${programIdFromUrl}, effective: ${initialProgramIdentifier}`);

      if (initialProgramIdentifier) {
        // Find if the identified program exists in the fetched programs list.
        const isValidProgram = fetchedPrograms.some(p => p.programId === initialProgramIdentifier);

        if (isValidProgram) {
          // If a valid program is found from the URL
          if (!selectedProgramIds.includes(initialProgramIdentifier)) {
            // Enforce single selection by setting the array to just this ID.
            setSelectedProgramIds([initialProgramIdentifier]);
            console.log(`[SignUp] Program selected from URL: ${initialProgramIdentifier}`);
          }
          // Move to the account details step if a valid program is pre-selected.
          if (currentStep !== 2) {
            setCurrentStep(2);
            console.log("[SignUp] Transitioned to Step 2 due to URL program.");
          }
          setGlobalError(""); // Clear any previous errors related to program selection
        } else {
          // If the program ID in the URL is invalid or not found.
          setGlobalError("The program you selected from the URL is not available. Please choose from the list below.");
          // Always revert to the program selection step if an invalid ID was provided.
          if (currentStep !== 1) {
            setCurrentStep(1);
            console.log("[SignUp] Reverted to Step 1 due to invalid URL program.");
          }
        }
      } else if (fetchedPrograms.length === 0) {
        // Case: No program ID in URL AND no programs were fetched (after loading completed without errors)
        setGlobalError("No programs are currently available for enrollment. Please check back later.");
        if (currentStep !== 1) { // Ensure we are on step 1 to show this message
          setCurrentStep(1);
        }
        console.log("[SignUp] No programs available after loading; defaulted to Step 1.");
      }
      // IMPORTANT: Removed the 'else { setCurrentStep(1); }' block here that caused the "blinking"
      // because it would unconditionally reset the step if no URL param was found,
      // conflicting with `handleNextStep`. The initial `useState(1)` covers the default.
    }
    // Dependencies: This effect should re-run if URL params, selected programs,
    // current step, or program data/loading states change.
  }, [programType, searchParams, selectedProgramIds, currentStep, fetchedPrograms, loadingPrograms, programsError]);

  /**
   * Memoized array of programs, each enriched with its associated courses.
   * This is passed to the ProgramSelection component.
   * It re-calculates only when `fetchedPrograms` or `allCourses` change.
   */
  const programsWithCourses = useMemo(() => {
    // Defensive check: Return an empty array early if data is not ready or empty.
    if (!fetchedPrograms || fetchedPrograms.length === 0 || !allCourses || allCourses.length === 0) {
      console.log(`[SignUp] programsWithCourses: Data not ready. fetchedPrograms: ${fetchedPrograms?.length}, allCourses: ${allCourses?.length}`);
      return [];
    }

    return fetchedPrograms.map(program => {
      // Filter all courses to find those belonging to the current program.
      const includedCourses = allCourses.filter(course =>
        // Ensure 'programIds' exists and is an array before calling 'includes'.
        course.programIds && Array.isArray(course.programIds) && course.programIds.includes(program.programId)
      );
      return {
        ...program,
        courses: includedCourses // Attach the filtered courses to the program object.
      };
    });
  }, [fetchedPrograms, allCourses]); // Dependencies for re-computation

  /**
   * Memoized total price calculation for the selected programs.
   * Efficiently re-calculates only when selected programs or fetched program data changes.
   */
  const totalPrice = useMemo(
    () =>
      selectedProgramIds.reduce((total, id) => {
        // Find the full program object by its ID from the fetched programs.
        const program = fetchedPrograms.find((p) => p.programId === id);
        // Add the program's price to the total, defaulting to 0 if price is missing.
        return total + (program?.price || 0);
      }, 0), // Initial total value is 0
    [selectedProgramIds, fetchedPrograms] // Dependencies
  );

  // --- Handlers for User Interactions ---

  /**
   * Handles the selection/deselection of a program module.
   * Enforces single program selection.
   */
  const handleProgramSelection = useCallback((programId) => {
    setSelectedProgramIds((prev) =>
      // If the clicked program is already selected, deselect it (empty array);
      // otherwise, select only the new program (replace previous selection).
      prev.includes(programId) ? [] : [programId]
    );
    setGlobalError(""); // Clear any general error message on user interaction.
  }, []); // No dependencies needed as `setSelectedProgramIds` and `setGlobalError` are stable.

  /**
   * Handles changes in the input fields of the Account Details form.
   * Updates the `formData` state.
   */
  const handleChange = useCallback(({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setGlobalError(""); // Clear any general error message on user input.
  }, []); // No dependencies needed as `setFormData` and `setGlobalError` are stable.

  /**
   * Handles moving from Step 1 (Program Selection) to Step 2 (Account Details).
   * Includes validation to ensure a program is selected and data is loaded.
   */
  const handleNextStep = useCallback(
    (e) => {
      e.preventDefault(); // Prevent default form submission and page reload.
      setGlobalError(""); // Clear previous errors before validation.

      if (currentStep === 1) { // Logic only applies when currently on Step 1
        if (loadingPrograms) {
          setGlobalError("Please wait, program options are still loading.");
          return;
        }
        if (programsError) {
          setGlobalError(`Cannot proceed due to a program loading error: ${programsError}. Please try reloading.`);
          return;
        }
        if (selectedProgramIds.length === 0) {
          setGlobalError("Please select a program module to proceed to account details.");
          return;
        }
        // If all checks pass, proceed to the next step.
        setCurrentStep(2);
        console.log("[SignUp] Moved to Step 2: Account Details.");
      }
    },
    [currentStep, selectedProgramIds, loadingPrograms, programsError] // Dependencies ensure handler re-creates only when necessary
  );

  /**
   * Handles moving back to the previous step (from Step 2 to 1).
   * Also handles navigating away if the user is on Step 1 and came via a program-specific URL.
   */
  const handlePreviousStep = useCallback(() => {
    setGlobalError(""); // Clear any error messages.
    if (currentStep === 2) {
      setCurrentStep(1); // Go back to Program Selection.
      console.log("[SignUp] Moved back to Step 1: Program Selection.");
    } else if (programType) {
      // If the user arrived via a program-specific URL and clicks back on Step 1,
      // navigate them away (e.g., to the homepage) instead of staying on step 1.
      navigate("/");
      console.log("[SignUp] Navigated home from program-specific URL.");
    }
    // If on step 1 and not from a programType URL, no action needed (stay on step 1).
  }, [currentStep, programType, navigate]); // Dependencies for handler re-creation

  /**
   * Handles the final submission of account details and initiates the payment process.
   * Triggers validation on AccountDetailsForm via ref.
   */
  const handleSubmitAccountDetails = useCallback(async () => {
    setGlobalError(""); // Clear previous errors.

    // Trigger validation logic exposed by the AccountDetailsForm via its ref.
    const isValid = accountDetailsFormRef.current?.triggerFormValidation();
    if (!isValid) {
      setGlobalError("Please correct the errors in your account details before proceeding.");
      return;
    }

    if (selectedProgramIds.length === 0) {
      // This case should ideally be prevented by handleNextStep, but acts as a final safeguard.
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

    const enrollmentDetails = {

      programId: selectedProgramIds[0],
    };

    try {
      console.log("[SignUp] Initiating payment...");
      await initiatePayment({ customerDetails, enrollmentDetails });
  
      console.log("[SignUp] Payment initiated successfully!");
    } catch (err) {
      console.error("[SignUp] Payment initiation failed:", err);
     
      setGlobalError(err.message || "Failed to initiate payment. Please review your details and try again.");
    }
  }, [formData, selectedProgramIds, initiatePayment]); // Dependencies for handler re-creation

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
        <div className={styles.errorMessage}>
          {typeof programsError === 'string' ? programsError : programsError.message || "An unknown error occurred."}
        </div>
        <button onClick={refetchPrograms} className={styles.retryButton}>
          Retry Loading Programs
        </button>
      </AuthLayout>
    );
  }

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
            programs={programsWithCourses} 
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