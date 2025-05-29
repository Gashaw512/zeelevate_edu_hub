// pages/SignUp/SignUp.jsx
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import axios from 'axios'; // Import axios

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

    const accountDetailsFieldsConfig = [
        { name: 'name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phoneNumber', 'label': 'Phone Number', type: 'tel', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
        { name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true },
    ];

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
        setTriggerAccountDetailsValidation(false);
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
        setTriggerAccountDetailsValidation(false);
        programType ? navigate('/') : setCurrentStep(prev => Math.max(1, prev - 1));
    }, [programType, navigate]);

  const handleSubmitAccountDetails = useCallback(async () => {
    console.log("handleSubmitAccountDetails called!"); // THIS IS THE FIRST THING TO CHECK
    setGlobalError('');
    setIsSubmitting(true);

    setTriggerAccountDetailsValidation(true);

    const finalCheckIsValid = validateSignUpFormData();
    console.log("Validation result:", finalCheckIsValid); // Add this

    if (!finalCheckIsValid) {
        setGlobalError('Please correct the highlighted fields in your account details to proceed.');
        setIsSubmitting(false);
        setTimeout(() => setTriggerAccountDetailsValidation(false), 0);
        return;
    }

    const firstCourse = MOCK_PROGRAMS.find(p => p.id === selectedProgramIds[0]);
    const totalPrice = calculateTotalPrice();

    const nameParts = formData.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    console.log("Data to send to backend:", { // Add this
        courseType: firstCourse ? firstCourse.id : '',
        customerDetails: {
            firstName,
            lastName,
            email: formData.email,
            authPassword: formData.password,
        },
        courseDetails: {
            title: firstCourse ? firstCourse.name : 'Selected Program',
            price: totalPrice,
        }
    });

    try {
        const response = await axios.post('http://localhost:3001/create-payment', {
            courseType: firstCourse ? firstCourse.id : '',
            customerDetails: {
                firstName,
                lastName,
                email: formData.email,
                authPassword: formData.password,
            },
            courseDetails: {
                title: firstCourse ? firstCourse.name : 'Selected Program',
                price: totalPrice,
            }
        });

        console.log("Backend response:", response.data); // Add this

        if (response.data.success && response.data.paymentUrl) {
            console.log("Redirecting to:", response.data.paymentUrl); // Add this
            window.location.href = response.data.paymentUrl;
        } else {
            setGlobalError(response.data.message || 'Payment link creation failed.');
            console.log("Payment link creation failed or success is false."); // Add this
        }
    } catch (err) {
        console.error('Payment error caught in frontend:', err); // Add this
        if (err.response && err.response.data && err.response.data.message) {
            setGlobalError(`Failed to initiate payment: ${err.response.data.message}`);
        } else {
            setGlobalError('Failed to initiate payment. Please try again later.');
        }
    } finally {
        setIsSubmitting(false);
        setTimeout(() => setTriggerAccountDetailsValidation(false), 0);
    }
}, [formData, selectedProgramIds, calculateTotalPrice, validateSignUpFormData]);

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