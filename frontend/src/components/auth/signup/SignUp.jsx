import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from "react";
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
  const { programType } = useParams();
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
    confirmPassword: ""
  });
  const [globalError, setGlobalError] = useState("");

  const {
    initiatePayment,
    isLoading: paymentLoading,
    error: paymentError
  } = useEnrollmentAndPayment();

  const isProgramSelectable = useCallback(status =>
    ['available','beta'].includes(status)
  , []);

  useEffect(() => {
    if (paymentError) {
      setGlobalError(paymentError.message || "Unexpected payment issue. Try again.");
    }
  }, [paymentError]);

  useEffect(() => {
    if (!loadingPrograms && !programsError && fetchedPrograms?.length) {
      const urlId = programType || searchParams.get("programId");
      if (urlId) {
        const found = fetchedPrograms.find(p => p.programId === urlId);
        if (found && isProgramSelectable(found.status)) {
          setSelectedProgramIds([urlId]);
          setCurrentStep(2);
          setGlobalError("");
        } else {
          setGlobalError(`The program "${found?.title || urlId}" is not available.`);
          setSelectedProgramIds([]);
          setCurrentStep(1);
        }
      }
    }
  }, [programType, searchParams, loadingPrograms, programsError, fetchedPrograms, isProgramSelectable]);

  const programsWithCourses = useMemo(() => {
    if (!Array.isArray(fetchedPrograms) || !Array.isArray(allCourses)) return [];
    return fetchedPrograms.map(prog => ({
      ...prog,
      courses: allCourses.filter(c =>
        Array.isArray(c.programIds) && c.programIds.includes(prog.programId)
      ),
      price: typeof prog.price === 'number' && !isNaN(prog.price)
             ? prog.price
             : Number(prog.price) || 0
    }));
  }, [fetchedPrograms, allCourses]);

  const currentlySelectedProgram = useMemo(() =>
    fetchedPrograms.find(p => p.programId === selectedProgramIds[0]) || null
  , [selectedProgramIds, fetchedPrograms]);

  const totalPrice = useMemo(() =>
    selectedProgramIds.reduce((sum, id) => {
      const prog = fetchedPrograms.find(p => p.programId === id);
      return isProgramSelectable(prog?.status)
        ? sum + (prog.price || 0)
        : sum;
    }, 0)
  , [selectedProgramIds, fetchedPrograms, isProgramSelectable]);

  const handleProgramSelection = useCallback(programId => {
    setGlobalError("");
    const prog = fetchedPrograms.find(p => p.programId === programId);
    if (prog && isProgramSelectable(prog.status)) {
      setSelectedProgramIds(prev =>
        prev.includes(programId) ? [] : [programId]
      );
    } else {
      setGlobalError(`"${prog?.title || 'This program'}" isn't available.`);
      setSelectedProgramIds([]);
    }
  }, [fetchedPrograms, isProgramSelectable]);

  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setGlobalError("");
  }, []);

  const handleNextStep = useCallback(e => {
    e.preventDefault();
    if (currentStep === 1) {
      if (loadingPrograms) return setGlobalError("Programs are still loading...");
      if (programsError) return setGlobalError(`Error: ${programsError}`);
      if (!selectedProgramIds.length) return setGlobalError("Select a program to continue.");

      setCurrentStep(2);
    }
  }, [currentStep, loadingPrograms, programsError, selectedProgramIds]);

  const handlePreviousStep = useCallback(() => {
    setGlobalError("");
    if (currentStep === 2) return setCurrentStep(1);
    navigate("/");
  }, [currentStep, navigate]);

  const handleSubmitAccountDetails = useCallback(async () => {
    setGlobalError("");
    const isValid = accountDetailsFormRef.current?.triggerFormValidation();
    if (!isValid) return setGlobalError("Please correct form errors.");
    const prog = currentlySelectedProgram;
    if (!prog || !isProgramSelectable(prog.status)) {
      setSelectedProgramIds([]);
      setCurrentStep(1);
      return setGlobalError("Selected program is no longer available.");
    }
    try {
      await initiatePayment({
        customerDetails: {
          firstName: formData.fName,
          lastName: formData.lName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password
        },
        enrollmentDetails: { programId: prog.programId }
      });
    } catch (e) {
      setGlobalError(e.message || "Payment initiation failed.");
    }
  }, [accountDetailsFormRef, currentlySelectedProgram, formData, initiatePayment, isProgramSelectable]);

  const layoutTitle = currentStep === 1
    ? "Choose Your Program Modules"
    : "Your Account Details";

  const layoutInstruction = currentStep === 1
    ? "Select the learning path that matches your goals."
    : "Provide your account info to complete enrollment.";

  if (loadingPrograms) {
    return (
      <AuthLayout
        title="Loading Programs…"
        instruction="Fetching available program options..."
        isWide
      >
        <div className={styles.loadingMessage}>Loading…</div>
      </AuthLayout>
    );
  }

  if (programsError) {
    return (
      <AuthLayout
        title="Error Loading Programs"
        instruction="Please try again."
        isWide
      >
        <div className={styles.errorMessage}>
          {typeof programsError === 'string'
            ? programsError
            : programsError.message}
        </div>
        <button onClick={refetchPrograms} className={styles.retryButton}>
          Retry
        </button>
      </AuthLayout>
    );
  }

  if (!fetchedPrograms?.length) {
    return (
      <AuthLayout
        title="No Programs Available"
        instruction="Check back later!"
        isWide
      >
        <p className={styles.infoMessage}>New programs coming soon.</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={layoutTitle}
      instruction={layoutInstruction}
      isWide={currentStep === 1}
      navLinkTo="/signin"
      navLinkLabel="Already have an account? Sign In"
    >
      <form onSubmit={e => e.preventDefault()} className={styles.enrollmentForm}>
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
          isNextDisabled={currentStep === 1 && !selectedProgramIds.length}
        />
      </form>
    </AuthLayout>
  );
};

export default SignUp;
