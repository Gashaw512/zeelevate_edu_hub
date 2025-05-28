import  { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { formData, selectedPrograms } = location.state || {};

  useEffect(() => {
    const handleCheckout = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payment/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            programId: selectedPrograms[0],
            email: formData.email
          })
        });

        const { url } = await response.json();
        window.location.href = url;
      } catch (err) {
        console.error("Error during checkout:", err);
        alert("Something went wrong. Please try again.");
        navigate("/signup");
      }
    };

    handleCheckout();
  }, []);

  return (
    <div className="sign-in-container">
      <h2 className="welcome-text">Redirecting to payment...</h2>
      <p>Please wait while we prepare your checkout page.</p>
    </div>
  );
};

export default CheckoutPage;