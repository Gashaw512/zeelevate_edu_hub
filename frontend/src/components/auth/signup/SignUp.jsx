// src/pages/SignUp/SignUp.jsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";

// Custom Hooks
import useEnrollmentAndPayment from "../../../hooks/useEnrollmentAndPayment";
import { usePrograms } from "../../../context/ProgramsContext";

// Child Components
import ProgramSelection from "./ProgramSelection";
import AccountDetailsForm from "./AccountDetailsForm";
import FormNavigation from "./FormNavigation";

// Layout Component
import AuthLayout from "../../layouts/auth/AuthLayout";

// Styles
import styles from "./SignUp.module.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { programType } = useParams(); // e.g., 'bootcamp', 'course' from /signup/:programType
  const accountDetailsFormRef = useRef();

  const {
    programs: fetchedPrograms,
    allCourses,
    loadingPrograms,
    programsError,
    refetchPrograms,
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

  const isProgramSelectable = useCallback((programStatus) => {
    return programStatus === 'available' || programStatus === 'beta';
  }, []);

  useEffect(() => {
    if (paymentError) {
      setGlobalError(paymentError.message || "An unexpected payment error occurred. Please try again.");
    } else if (globalError === (paymentError?.message || "An unexpected payment error occurred. Please try again.")) {
      // Clear payment-related global error if it was the last one set
      setGlobalError("");
    }
  }, [paymentError, globalError]);

  useEffect(() => {
    // Only proceed with URL parameter logic once programs are loaded and no errors exist
    if (!loadingPrograms && !programsError && Array.isArray(fetchedPrograms)) {
      const programIdFromUrlQuery = searchParams.get("programId");
      const initialProgramIdentifier = programType || programIdFromUrlQuery;

      console.debug(`[SignUp] Init URL: Path='${programType || 'N/A'}', Query='${programIdFromUrlQuery || 'N/A'}', Effective='${initialProgramIdentifier || 'N/A'}'`);

      if (initialProgramIdentifier) {
        const foundProgram = fetchedPrograms.find(p => p.programId === initialProgramIdentifier);

        if (foundProgram) {
          if (isProgramSelectable(foundProgram.status)) {
            if (!selectedProgramIds.includes(initialProgramIdentifier)) {
              setSelectedProgramIds([initialProgramIdentifier]);
              console.debug(`[SignUp] Program pre-selected from URL: ${initialProgramIdentifier}`);
            }
            if (currentStep !== 2) {
              setCurrentStep(2);
              console.debug("[SignUp] Transitioned to Step 2 due to URL pre-selection.");
            }
            setGlobalError("");
          } else {
            setGlobalError(`The program "${foundProgram.title}" is currently ${foundProgram.status === 'unavailable' ? 'unavailable' : 'full'}. Please choose an available program.`);
            setSelectedProgramIds([]);
            if (currentStep !== 1) {
              setCurrentStep(1);
              console.debug("[SignUp] Reverted to Step 1: Unselectable URL program.");
            }
          }
        } else {
          setGlobalError("The program you selected from the URL is not found or available. Please choose from the list below.");
          setSelectedProgramIds([]);
          if (currentStep !== 1) {
            setCurrentStep(1);
            console.debug("[SignUp] Reverted to Step 1: Invalid/non-existent URL program.");
          }
        }
      } else if (fetchedPrograms.length === 0 && !loadingPrograms) {
        setGlobalError("No programs are currently available for enrollment. Please check back later.");
        if (currentStep !== 1) {
          setCurrentStep(1);
        }
        console.debug("[SignUp] No programs available; defaulted to Step 1.");
      }
    }
  }, [programType, searchParams, selectedProgramIds, currentStep, fetchedPrograms, loadingPrograms, programsError, isProgramSelectable]);

  const programsWithCourses = useMemo(() => {
    if (!Array.isArray(fetchedPrograms) || fetchedPrograms.length === 0 || !Array.isArray(allCourses) || allCourses.length === 0) {
      console.debug(`[SignUp] programsWithCourses: Data not ready. fetchedPrograms length: ${fetchedPrograms?.length || 0}, allCourses length: ${allCourses?.length || 0}`);
      return [];
    }

    return fetchedPrograms.map(program => {
      const includedCourses = allCourses.filter(course =>
        Array.isArray(course.programIds) && course.programIds.includes(program.programId)
      );
      return {
        ...program,
        courses: includedCourses,
        // Ensure price is a number with a fallback for robustness
        price: typeof program.price === 'number' && !isNaN(program.price) ? program.price : (Number(program.price) || 0),
      };
    });
  }, [fetchedPrograms, allCourses]);

  const currentlySelectedProgram = useMemo(() => {
      if (selectedProgramIds.length > 0 && Array.isArray(fetchedPrograms)) {
          return fetchedPrograms.find(p => p.programId === selectedProgramIds[0]);
      }
      return null;
  }, [selectedProgramIds, fetchedPrograms]);

  const totalPrice = useMemo(
    () => {
      if (!Array.isArray(selectedProgramIds) || selectedProgramIds.length === 0 || !Array.isArray(fetchedPrograms)) {
        return 0; // Default to 0 if nothing selected or programs not yet available
      }

      const calculatedPrice = selectedProgramIds.reduce((total, id) => {
        const program = fetchedPrograms.find((p) => p.programId === id);
        const priceToAdd = (program && typeof program.price === 'number' && !isNaN(program.price))
                           ? program.price
                           : 0;
        return total + (isProgramSelectable(program?.status) ? priceToAdd : 0);
      }, 0);
      console.debug("Calculated totalPrice:", calculatedPrice, "Type:", typeof calculatedPrice);
      return calculatedPrice;
    },
    [selectedProgramIds, fetchedPrograms, isProgramSelectable]
  );

  const handleProgramSelection = useCallback((programId) => {
    setGlobalError("");
    const programToSelect = fetchedPrograms.find(p => p.programId === programId);

    if (programToSelect && isProgramSelectable(programToSelect.status)) {
        setSelectedProgramIds((prev) =>
            prev.includes(programId) ? [] : [programId]
        );
    } else {
        setGlobalError(`The program "${programToSelect?.title || 'selected program'}" is currently ${programToSelect?.status === 'unavailable' ? 'unavailable' : programToSelect?.status === 'full' ? 'full' : 'not available'}. Please choose an available program.`);
        setSelectedProgramIds([]);
    }
  }, [fetchedPrograms, isProgramSelectable]);

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
          setGlobalError("Please wait, program options are still loading.");
          return;
        }
        if (programsError) {
          setGlobalError(`Cannot proceed due to a program loading error: ${programsError.message || programsError}. Please try reloading.`);
          return;
        }
        if (selectedProgramIds.length === 0) {
          setGlobalError("Please select a program module to proceed to account details.");
          return;
        }

        const selectedProgram = fetchedPrograms.find(p => p.programId === selectedProgramIds[0]);
        if (!selectedProgram || !isProgramSelectable(selectedProgram.status)) {
            setGlobalError(`The selected program "${selectedProgram?.title || 'program'}" is currently ${selectedProgram?.status === 'unavailable' ? 'unavailable' : selectedProgram?.status === 'full' ? 'full' : 'not available'}. Please choose an available program.`);
            setSelectedProgramIds([]);
            return;
        }

        setCurrentStep(2);
        console.debug("[SignUp] Moved to Step 2: Account Details.");
      }
    },
    [currentStep, selectedProgramIds, loadingPrograms, programsError, fetchedPrograms, isProgramSelectable]
  );

  const handlePreviousStep = useCallback(() => {
    setGlobalError("");
    if (currentStep === 2) {
      setCurrentStep(1);
      console.debug("[SignUp] Moved back to Step 1: Program Selection.");
    } else if (programType || searchParams.get("programId")) {
      navigate("/");
      console.debug("[SignUp] Navigated home from program-specific URL.");
    }
  }, [currentStep, programType, searchParams, navigate]);

  const handleSubmitAccountDetails = useCallback(async () => {
    setGlobalError("");

    const isValid = accountDetailsFormRef.current?.triggerFormValidation();
    if (!isValid) {
      setGlobalError("Please correct the errors in your account details before proceeding.");
      return;
    }

    if (selectedProgramIds.length === 0) {
      setGlobalError("No program selected for enrollment. Please go back to Step 1 and select a program.");
      return;
    }

    const programForEnrollment = fetchedPrograms.find(p => p.programId === selectedProgramIds[0]);
    if (!programForEnrollment || !isProgramSelectable(programForEnrollment.status)) {
        setGlobalError(`Cannot enroll: The selected program "${programForEnrollment?.title || 'program'}" is no longer available or is full. Please re-select a program.`);
        setSelectedProgramIds([]);
        setCurrentStep(1);
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
      console.debug("[SignUp] Initiating payment...");
      await initiatePayment({ customerDetails, enrollmentDetails });
      console.debug("[SignUp] Payment initiated successfully!");
    } catch (err) {
      console.error("[SignUp] Payment initiation failed:", err);
      setGlobalError(err.message || "Failed to initiate payment. Please review your details and try again.");
    }
  }, [formData, selectedProgramIds, initiatePayment, fetchedPrograms, isProgramSelectable]);

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

  const isNextButtonDisabled = useMemo(() => {
    if (selectedProgramIds.length === 0) return true;
    if (currentlySelectedProgram) {
        return !isProgramSelectable(currentlySelectedProgram.status);
    }
    return true;
  }, [selectedProgramIds, currentlySelectedProgram, isProgramSelectable]);

  // Render based on data loading and error states
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

  if (!Array.isArray(fetchedPrograms) || fetchedPrograms.length === 0) {
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
          isNextDisabled={currentStep === 1 ? isNextButtonDisabled : false}
        />
      </form>
    </AuthLayout>
  );
};

export default SignUp;