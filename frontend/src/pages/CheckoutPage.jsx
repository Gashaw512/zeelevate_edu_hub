// CheckoutPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Destructure data from location.state
  const { formData, coursesToEnroll, totalPrice } = location.state || {};

  useEffect(() => {
    if (!location.state) {
      // Redirect to home if no state passed
      navigate("/");
    }
  }, [location, navigate]);

  // Pick first course for checkout
  const course = coursesToEnroll && coursesToEnroll.length > 0 ? coursesToEnroll[0] : null;

  if (!formData || !course) {
    return (
      <div className="max-w-md mx-auto p-4">
        <p className="text-red-600 font-semibold">
          Missing enrollment data. Please return to the sign-up page and try again.
        </p>
      </div>
    );
  }

  // Basic split for first and last name (can be improved)
  const firstName = formData.name ? formData.name.split(' ')[0] : '';
  const lastName = formData.name ? formData.name.split(' ').slice(1).join(' ') : '';

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const response = await axios.post('/create-payment', {
        courseType: course.id,
        customerDetails: {
          firstName,
          lastName,
          email: formData.email,
        },
        courseDetails: {
          title: course.name,
          price: totalPrice,
        }
      });

      if (response.data.success && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        alert('Payment link creation failed.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Enroll in {course.name}</h2>
      <p className="mb-2">Name: {formData.name}</p>
      <p className="mb-4">Email: {formData.email}</p>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Redirecting...' : `Pay $${totalPrice}`}
      </button>
    </div>
  );
};

export default CheckoutPage;
