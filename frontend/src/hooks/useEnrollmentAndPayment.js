import { useState, useCallback } from 'react';
import axios from 'axios';

// This hook initiates the payment flow and redirects to Square.
// It DOES NOT create Firebase user or log in directly.

const useEnrollmentAndPayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiatePayment = useCallback(async (payload) => {
    console.log(payload)
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        'http://localhost:3001/api/payments/create-payment', 
        payload,
        { timeout: 60000 }
      );
      
      if (response.data.success && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error(response.data.message || 'Payment link creation failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Failed to initiate payment. Please try again later.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { initiatePayment, isLoading, error };
};

export default useEnrollmentAndPayment;