// src/pages/SignUp/SignUp.jsx

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
  // This expects the route to be like /signup/:programId
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
   * Helper function to determine if a program is currently selectable.
   * This logic should match the one in ProgramSelection.jsx to ensure consistency.
   */
  const isProgramSelectable = useCallback((programStatus) => {
    return programStatus === 'available' || programStatus === 'beta';
  }, []);

  /**
   * Effect to handle and display any errors from the payment initiation process.
   * Clears existing global errors if payment error is resolved.
   */
  useEffect(() => {
    if (paymentError) {
      setGlobalError(paymentError.message || "An unexpected payment error occurred. Please try again.");
    } else {
      // If paymentError transitions from true to false, clear the related global error
      if (globalError === (paymentError?.message || "An unexpected payment error occurred. Please try again.")) {
        setGlobalError("");
      }
    }
  }, [paymentError, globalError]); // Include globalError in dependencies to check if it's the payment error

  /**
   * Effect to initialize the form step and program selection based on URL parameters.
   * Runs on component mount and when URL or program data changes.
   * This is crucial for direct links to specific programs.
   */
  useEffect(() => {
    // Only proceed if programs are no longer loading and there are no loading errors.
    if (!loadingPrograms && !programsError) {
      const programIdFromUrlQuery = searchParams.get("programId");
      // Prioritize path parameter (e.g., /signup/abc) over query parameter (e.g., /signup?programId=abc)
      const initialProgramIdentifier = programType || programIdFromUrlQuery;

      console.log(`[SignUp] Initializing: Program ID from URL path: ${programType || 'N/A'}, from query: ${programIdFromUrlQuery || 'N/A'}, effective: ${initialProgramIdentifier || 'N/A'}`);

      if (initialProgramIdentifier) {
        // Find if the identified program exists in the fetched programs list.
        const foundProgram = fetchedPrograms.find(p => p.programId === initialProgramIdentifier);

        if (foundProgram) {
          // If a valid program is found from the URL
          if (isProgramSelectable(foundProgram.status)) {
            if (!selectedProgramIds.includes(initialProgramIdentifier)) {
              // Enforce single selection by setting the array to just this ID.
              setSelectedProgramIds([initialProgramIdentifier]);
              console.log(`[SignUp] Program selected from URL: ${initialProgramIdentifier}`);
            }
            // Move to the account details step if a valid, selectable program is pre-selected.
            if (currentStep !== 2) {
              setCurrentStep(2);
              console.log("[SignUp] Transitioned to Step 2 due to URL program.");
            }
            setGlobalError(""); // Clear any previous errors related to program selection
          } else {
            // Program found, but it's not selectable (e.g., 'unavailable' or 'full')
            setGlobalError(`The program "${foundProgram.title}" is currently ${foundProgram.status === 'unavailable' ? 'unavailable' : 'full'}. Please choose an available program from the list.`);
            // Revert to the program selection step to allow user to pick a valid one.
            setSelectedProgramIds([]); // Clear the invalid selection
            if (currentStep !== 1) {
              setCurrentStep(1);
              console.log("[SignUp] Reverted to Step 1: Invalid (unselectable) URL program.");
            }
          }
        } else {
          // If the program ID in the URL is invalid or not found.
          setGlobalError("The program you selected from the URL is not found or available. Please choose from the list below.");
          setSelectedProgramIds([]); // Ensure nothing is selected
          // Always revert to the program selection step if an invalid ID was provided.
          if (currentStep !== 1) {
            setCurrentStep(1);
            console.log("[SignUp] Reverted to Step 1 due to invalid/non-existent URL program.");
          }
        }
      } else if (fetchedPrograms.length === 0 && !loadingPrograms) {
        // Case: No program ID in URL AND no programs were fetched (after loading completed without errors)
        setGlobalError("No programs are currently available for enrollment. Please check back later.");
        if (currentStep !== 1) { // Ensure we are on step 1 to show this message
          setCurrentStep(1);
        }
        console.log("[SignUp] No programs available after loading; defaulted to Step 1.");
      }
    }
    // Dependencies: This effect should re-run if URL params, selected programs,
    // current step, or program data/loading states change.
  }, [programType, searchParams, selectedProgramIds, currentStep, fetchedPrograms, loadingPrograms, programsError, isProgramSelectable]);

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
   * Memoized current selected program object for easy access to its status and details.
   */
  const currentlySelectedProgram = useMemo(() => {
      if (selectedProgramIds.length > 0) {
          return fetchedPrograms.find(p => p.programId === selectedProgramIds[0]);
      }
      return null;
  }, [selectedProgramIds, fetchedPrograms]);

  /**
   * Memoized total price calculation for the selected programs.
   * Efficiently re-calculates only when selected programs or fetched program data changes.
   */
  const totalPrice = useMemo(
    () =>
      selectedProgramIds.reduce((total, id) => {
        // Find the full program object by its ID from the fetched programs.
        const program = fetchedPrograms.find((p) => p.programId === id);
        // Only add price if program is selectable, otherwise it's 0 for calculation purposes here.
        return total + (isProgramSelectable(program?.status) ? (program?.price || 0) : 0);
      }, 0), // Initial total value is 0
    [selectedProgramIds, fetchedPrograms, isProgramSelectable] // Dependencies
  );

  // --- Handlers for User Interactions ---

  /**
   * Handles the selection/deselection of a program module.
   * Enforces single program selection and checks if the program is selectable.
   */
  const handleProgramSelection = useCallback((programId) => {
    setGlobalError(""); // Clear any general error message on user interaction.

    const programToSelect = fetchedPrograms.find(p => p.programId === programId);

    if (programToSelect && isProgramSelectable(programToSelect.status)) {
        setSelectedProgramIds((prev) =>
            // If the clicked program is already selected, deselect it (empty array);
            // otherwise, select only the new program (replace previous selection).
            prev.includes(programId) ? [] : [programId]
        );
    } else {
        // If an attempt is made to select an unselectable program, show an error and clear selection
        setGlobalError(`The program "${programToSelect?.title || 'selected program'}" is currently ${programToSelect?.status === 'unavailable' ? 'unavailable' : programToSelect?.status === 'full' ? 'full' : 'not available'}. Please choose an available program.`);
        setSelectedProgramIds([]); // Clear any invalid selection
    }
  }, [fetchedPrograms, isProgramSelectable]); // Depends on fetchedPrograms and isProgramSelectable

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

        // NEW VALIDATION: Ensure the selected program is actually selectable
        const selectedProgram = fetchedPrograms.find(p => p.programId === selectedProgramIds[0]);
        if (!selectedProgram || !isProgramSelectable(selectedProgram.status)) {
            setGlobalError(`The selected program "${selectedProgram?.title || 'program'}" is currently ${selectedProgram?.status === 'unavailable' ? 'unavailable' : selectedProgram?.status === 'full' ? 'full' : 'not available'}. Please choose an available program.`);
            // Also clear the selection to force user to pick a valid one.
            setSelectedProgramIds([]);
            return;
        }

        // If all checks pass, proceed to the next step.
        setCurrentStep(2);
        console.log("[SignUp] Moved to Step 2: Account Details.");
      }
    },
    [currentStep, selectedProgramIds, loadingPrograms, programsError, fetchedPrograms, isProgramSelectable] // Dependencies updated
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
    } else if (programType || searchParams.get("programId")) {
      // If the user arrived via a program-specific URL (path or query) and clicks back on Step 1,
      // navigate them away (e.g., to the homepage) instead of staying on step 1.
      navigate("/");
      console.log("[SignUp] Navigated home from program-specific URL.");
    }
    // If on step 1 and not from a programType URL, no action needed (stay on step 1).
  }, [currentStep, programType, searchParams, navigate]); // Dependencies for handler re-creation

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

    // Final check for program selectability before payment initiation
    const programForEnrollment = fetchedPrograms.find(p => p.programId === selectedProgramIds[0]);
    if (!programForEnrollment || !isProgramSelectable(programForEnrollment.status)) {
        setGlobalError(`Cannot enroll: The selected program "${programForEnrollment?.title || 'program'}" is no longer available or is full. Please re-select a program.`);
        setSelectedProgramIds([]); // Clear the invalid selection
        setCurrentStep(1); // Go back to selection step
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
      programId: selectedProgramIds[0], // Assuming single program selection
    };

    try {
      console.log("[SignUp] Initiating payment...");
      await initiatePayment({ customerDetails, enrollmentDetails });

      console.log("[SignUp] Payment initiated successfully!");
      // On success, the useEnrollmentAndPayment hook or its parent (e.g., AuthContext)
      // should handle redirection or state update.
    } catch (err) {
      console.error("[SignUp] Payment initiation failed:", err);
      // Ensure the error message is user-friendly
      setGlobalError(err.message || "Failed to initiate payment. Please review your details and try again.");
    }
  }, [formData, selectedProgramIds, initiatePayment, fetchedPrograms, isProgramSelectable]); // Dependencies for handler re-creation

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

  // Determine if the "Next" button should be disabled on Step 1
  const isNextButtonDisabled = useMemo(() => {
    // If no programs are selected, disable
    if (selectedProgramIds.length === 0) return true;

    // If a program is selected, check its availability
    if (currentlySelectedProgram) {
        return !isProgramSelectable(currentlySelectedProgram.status);
    }
    // Fallback, should not be reached if selectedProgramIds.length > 0
    return true;
  }, [selectedProgramIds, currentlySelectedProgram, isProgramSelectable]);


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
          isNextDisabled={currentStep === 1 ? isNextButtonDisabled : false} // Pass disable prop to FormNavigation for Step 1
        />
      </form>
    </AuthLayout>
  );
};

export default SignUp;