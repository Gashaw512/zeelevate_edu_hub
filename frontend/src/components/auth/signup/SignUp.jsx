import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import useEnrollmentAndPayment from "../../../hooks/useEnrollmentAndPayment";
import ProgramSelection from "./ProgramSelection";
import AccountDetailsForm from "./AccountDetailsForm";
import FormNavigation from "./FormNavigation";
import AuthLayout from "../../layouts/auth/AuthLayout";
import SocialAuthButtons from "../../common/SocialAuthButton";
import { getAllProviders } from "../../../data/externalAuthProviderConfig";
import { MOCK_PROGRAMS } from "../../../data/mockPrograms";
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

  // Payment hook
  const {
    initiatePayment,
    isLoading: paymentLoading,
    error: paymentError,
  } = useEnrollmentAndPayment();

  // Program selection from URL
  useEffect(() => {
    const programIdFromUrl = searchParams.get("programId");
    let matchedProgram = null;

    if (programType) {
      matchedProgram = MOCK_PROGRAMS.find((p) => p.id.startsWith(programType));
    } else if (programIdFromUrl) {
      matchedProgram = MOCK_PROGRAMS.find((p) => p.id === programIdFromUrl);
    }

    if (matchedProgram && !selectedProgramIds.includes(matchedProgram.id)) {
      setSelectedProgramIds([matchedProgram.id]);
      if (programType) setCurrentStep(2);
    }
  }, [searchParams, selectedProgramIds, programType]);

  //   Total Price calculator
  const totalPrice = useMemo(
    () =>
      selectedProgramIds.reduce((total, id) => {
        const program = MOCK_PROGRAMS.find((p) => p.id === id);
        return total + (program?.fixedPrice || 0);
      }, 0),
    [selectedProgramIds]
  );

  // Handlers
  const handleProgramSelection = useCallback((programId) => {
    setSelectedProgramIds((prev) =>
      prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [programId]
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

      if (currentStep === 1 && selectedProgramIds.length === 0) {
        setGlobalError("Please select at least one program module to proceed.");
        return;
      }
      setCurrentStep(2);
    },
    [currentStep, selectedProgramIds]
  );

  const handlePreviousStep = useCallback(() => {
    setGlobalError("");
    programType ? navigate("/") : setCurrentStep(1);
  }, [programType, navigate]);

  const handleSubmitAccountDetails = useCallback(async () => {
    setGlobalError("");

    // Validate form via ref
    const isValid = accountDetailsFormRef.current?.triggerFormValidation();
    if (!isValid) return;

    // Prepare data
    const firstCourse = MOCK_PROGRAMS.find(
      (p) => p.id === selectedProgramIds[0]
    );
    const totalPrice = selectedProgramIds.reduce((total, id) => {
      const program = MOCK_PROGRAMS.find((p) => p.id === id);
      return total + (program?.fixedPrice || 0);
    }, 0);

    // const nameParts = formData.name.split(" ");
    const customerDetails = {
      firstName: formData.fName,
      lastName: formData.lName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
    };

    const courseDetails = {
      title: firstCourse?.name || "Selected Program",
      price: totalPrice,
      courseId: "b8d649fb-e13e-4aba-a95e-f8e3bdaea57c",
    };
    try {
      
      await initiatePayment({ customerDetails, courseDetails });
    } catch (err) {
      console.error("Payment initiation error:", err);
    }
  }, [formData, selectedProgramIds, initiatePayment]);

  const handleSocialAuthIntent = useCallback((providerName) => {
    setGlobalError(
      `${providerName} registration requires payment-first flow. Please use email/password or contact support.`
    );
  }, []);

  // Determine AuthLayout title and instruction based on current step
  const layoutTitle =
    currentStep === 1 ? "Enroll in Programs" : "Account Details";
  const layoutInstruction =
    currentStep === 1
      ? "Select the program modules that best fit your learning goals."
      : "Provide your personal and account details to complete your enrollment.";

  // Determine AuthLayout wide status
  // const isLayoutWide = currentStep === 1 || 2; // Program selection is wide, account details is narrow
  const isLayoutWide = currentStep === 1 || currentStep === 2;


  return (
    <AuthLayout
      title={layoutTitle} // Use the dynamic title
      instruction={layoutInstruction} // Use the dynamic instruction
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
            programs={MOCK_PROGRAMS}
            selectedProgramIds={selectedProgramIds}
            onProgramSelect={handleProgramSelection}
            totalPrice={totalPrice} // Pass calculated total instead of function
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

      <p className={styles.signUpPrompt}>
        Already have an account?{" "}
        <a href="/signin" className={styles.link}>
          Sign In
        </a>
      </p>

      <div className={styles.divider}>
        <span className={styles.dividerText}>OR</span>
      </div>

      <SocialAuthButtons
        providers={externalProviders}
        onSignIn={handleSocialAuthIntent}
      />
    </AuthLayout>
  );
};

export default SignUp;
