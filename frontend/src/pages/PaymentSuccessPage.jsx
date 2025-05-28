// frontend/src/pages/PaymentSuccessPage.jsx
import  { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createUserWithEmailAndPassword, auth } from "../firebase/auth";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId"); // Comes from Square redirect
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Step 1: Verify payment
        const verifyRes = await fetch(`${process.env.REACT_APP_API_URL}/verify-payment?orderId=${orderId}`);
        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
          throw new Error("Payment verification failed");
        }

        // Step 2: Get pending user data
        const userDataJSON = localStorage.getItem("pendingUser");
        if (!userDataJSON) {
          alert("No user data found. Please sign up again.");
          navigate("/signup");
          return;
        }

        const userData = JSON.parse(userDataJSON);

        // Step 3: Create Firebase user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );

        const user = userCredential.user;

        // Step 4: Save user to Firestore via backend
        await fetch(`${process.env.REACT_APP_API_URL}/save-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            email: userData.email,
            name: userData.name,
            courseId: verifyData.courseId,
          }),
        });

        // Step 5: Clean up and redirect
        localStorage.removeItem("pendingUser");
        navigate("/student/dashboard");
      } catch (error) {
        console.error("Registration failed:", error.message);
        alert("Something went wrong. Please contact support.");
        navigate("/signin");
      }
    };

    handlePaymentSuccess();
  }, []);

  return <div>Processing your payment and registering you...</div>;
};


export default PaymentSuccessPage;