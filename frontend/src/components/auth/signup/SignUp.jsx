// pages/SignUp/SignUp.jsx
import { useState, useEffect, useCallback } from "react"; // Import useRef
import { useSearchParams, useNavigate, useParams } from "react-router-dom";

import ProgramSelection from "./ProgramSelection";
import AccountDetailsForm from "./AccountDetailsForm";
import FormNavigation from "./FormNavigation";

import AuthLayout from "../../layouts/auth/AuthLayout";
import SocialAuthButtons from "../../common/SocialAuthButton";
import { getAllProviders } from "../../../data/externalAuthProviderConfig";
import { MOCK_PROGRAMS } from "../../../data/mockPrograms";

// import useFormValidation from "../../../hooks/useFormValidation"; 
import styles from "./SignUp.module.css";

const SignUp = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { programType } = useParams();
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
    const [globalError, setGlobalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [triggerAccountDetailsValidation, setTriggerAccountDetailsValidation] = useState(false);

    // To use `validateAccountDetailsForm` from the hook in SignUp,
    // we need to instantiate the hook here as well.
    // However, it's generally cleaner if AccountDetailsForm handles its own validation display
    // and SignUp only performs the final check.
    // For the final check, we don't *need* the useFormValidation state (fieldErrors, isValid) here,
    // just the `validate` function. We can mock it for this final check if needed,
    // or rely on AccountDetailsForm's internal validation for display.

    // Let's explicitly define the config here for the local validation check in SignUp
    const accountDetailsFieldsConfig = [
        { name: 'name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phoneNumber', 'label': 'Phone Number', type: 'tel', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
        { name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true },
    ];

    // Create a local validation function for SignUp's final check
    const validateSignUpFormData = useCallback(() => {
        let errors = {};
        let currentFormIsValid = true;

        accountDetailsFieldsConfig.forEach(field => {
            if (field.required && !formData[field.name]) {
                errors[field.name] = `${field.label} is required.`;
                currentFormIsValid = false;
            }
        });

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format.';
            currentFormIsValid = false;
        }
        if (formData.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters.';
            currentFormIsValid = false;
        }
        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match.';
            currentFormIsValid = false;
        }
        // SignUp just needs to know if it's valid, not the specific errors here.
        // AccountDetailsForm will display them.
        return currentFormIsValid;
    }, [formData, accountDetailsFieldsConfig]);


    useEffect(() => {
        const programIdFromUrl = searchParams.get('programId');

        if (programType) {
            const match = MOCK_PROGRAMS.find(p => p.id.startsWith(programType));
            if (match && !selectedProgramIds.includes(match.id)) {
                setSelectedProgramIds([match.id]);
                setCurrentStep(2);
            }
        } else if (programIdFromUrl) {
            const exists = MOCK_PROGRAMS.some(p => p.id === programIdFromUrl);
            if (exists && !selectedProgramIds.includes(programIdFromUrl)) {
                setSelectedProgramIds([programIdFromUrl]);
            }
        }
    }, [searchParams, selectedProgramIds, programType]);

    const calculateTotalPrice = useCallback(() =>
        selectedProgramIds.reduce((total, id) => {
            const program = MOCK_PROGRAMS.find(p => p.id === id);
            return total + (program?.fixedPrice || 0);
        }, 0),
        [selectedProgramIds]
    );

    const handleProgramSelection = useCallback((programId) => {
        setSelectedProgramIds(prev =>
            prev.includes(programId) ? prev.filter(id => id !== programId) : [programId]
        );
        setGlobalError('');
    }, []);

    const handleChange = useCallback(({ target: { name, value } }) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setGlobalError('');
        setTriggerAccountDetailsValidation(false); // Reset trigger when user types
        // No need to call setFieldErrors from SignUp, AccountDetailsForm's hook handles it
    }, []);

    const handleNextStep = useCallback((e) => {
        e.preventDefault();
        setGlobalError('');

        if (currentStep === 1) {
            if (selectedProgramIds.length === 0) {
                setGlobalError('Please select at least one program module to proceed.');
                return;
            }
            setCurrentStep(2);
        }
    }, [currentStep, selectedProgramIds]);

    const handlePreviousStep = useCallback(() => {
        setGlobalError('');
        setTriggerAccountDetailsValidation(false); // Reset trigger when going back
        // No need to call setFieldErrors from SignUp, AccountDetailsForm's hook handles it
        programType ? navigate('/') : setCurrentStep(prev => Math.max(1, prev - 1));
    }, [programType, navigate]);

    const handleSubmitAccountDetails = useCallback(async () => {
        setGlobalError('');
        setIsSubmitting(true);

        // 1. Trigger validation in AccountDetailsForm to display errors
        setTriggerAccountDetailsValidation(true);

        // 2. Perform the final validation check in SignUp
        const finalCheckIsValid = validateSignUpFormData(); // Use the local validation function

        if (!finalCheckIsValid) {
            setGlobalError('Please correct the highlighted fields in your account details to proceed.');
            setIsSubmitting(false);
            // IMPORTANT: Reset the trigger after validation is done
            setTimeout(() => setTriggerAccountDetailsValidation(false), 0); // Reset after render cycle
            return;
        }

        // If validation passes, proceed with submission
        await new Promise(res => setTimeout(res, 500));

        const coursesToEnroll = selectedProgramIds.flatMap(programId => {
            const program = MOCK_PROGRAMS.find(p => p.id === programId);
            return program?.courses.map(course => ({
                ...course,
                programId: program.id,
                programName: program.name
            })) || [];
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
        // IMPORTANT: Reset the trigger even on success
        setTimeout(() => setTriggerAccountDetailsValidation(false), 0);
    }, [formData, selectedProgramIds, calculateTotalPrice, navigate, validateSignUpFormData]); // validateSignUpFormData is a dependency

    const handleSocialAuthIntent = useCallback((providerName) => {
        setGlobalError("For payment-first flow, social sign-in needs backend coordination to avoid pre-payment registration.");
    }, []);

    return (
        <AuthLayout
            title="Enroll in Programs"
            instruction={currentStep === 1 ? "Select your program modules." : "Provide your details to begin your learning journey."}
            isWide={currentStep === 1}
        >
            <form onSubmit={e => e.preventDefault()} className={styles.enrollmentForm}>
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
                        isSubmitting={isSubmitting}
                        triggerValidation={triggerAccountDetailsValidation}
                    />
                )}

                {globalError && <p className={styles.errorMessage}>{globalError}</p>}

                <FormNavigation
                    currentStep={currentStep}
                    isSubmitting={isSubmitting}
                    onPreviousStep={handlePreviousStep}
                    onNextStep={handleNextStep}
                    onFinalSubmit={handleSubmitAccountDetails}
                    selectedProgramIdsLength={selectedProgramIds.length}
                />
            </form>

            <p className={styles.signUpPrompt}>
                Already have an account? <a href="/signin" className={styles.link}>Sign In</a>
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