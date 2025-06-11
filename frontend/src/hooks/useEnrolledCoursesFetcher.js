import { useState, useEffect, useCallback } from 'react';

const useEnrolledCoursesFetcher = (userId) => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(true);
    const [enrollmentsError, setEnrollmentsError] = useState(null);

    const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL;

    const fetchEnrollments = useCallback(async () => {
        if (!userId) {
            setEnrolledCourses([]);
            setLoadingEnrollments(false);
            setEnrollmentsError(null);
            return;
        }

        setLoadingEnrollments(true);
        setEnrollmentsError(null); // Clear previous errors

        try {
            // --- IMPORTANT: Implement your actual API call here ---
            const response = await fetch(`${BACKEND_API_URL}/api/users/get-enrollments`, {
                method: 'POST', // Or 'GET'
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${yourAuthToken}`, // If your backend needs it
                },
                body: JSON.stringify({ uid: userId }),
            });

            if (!response.ok) {
                let errorDetail = `Server responded with status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorDetail = errorData.message;
                    }
                } catch (jsonError) {
                    console.warn('Could not parse error response as JSON:', jsonError);
                }
                throw new Error(`Failed to fetch enrollments: ${errorDetail}`);
            }

            const data = await response.json();
            if (data && Array.isArray(data.enrollments)) {
                // --- CRITICAL FIX: Ensure 'status' is always present, default to 'unknown' ---
                const formattedEnrollments = data.enrollments.map(course => ({
                    ...course,
                    status: course.status || 'unknown' // Default to 'unknown' if status is missing
                }));
                setEnrolledCourses(formattedEnrollments);
            } else {
                console.warn('API returned unexpected data structure for enrollments:', data);
                setEnrolledCourses([]);
                throw new Error('Received invalid data structure for enrollments.');
            }
        } catch (err) {
            console.error("Error fetching enrolled courses:", err);
            setEnrollmentsError(`Failed to load enrolled courses: ${err.message}. Please try again.`);
        } finally {
            setLoadingEnrollments(false);
        }
    }, [userId, BACKEND_API_URL]);

    useEffect(() => {
        fetchEnrollments();
    }, [fetchEnrollments]);

    return { enrolledCourses, loadingEnrollments, enrollmentsError, refetchEnrollments: fetchEnrollments };
};

export default useEnrolledCoursesFetcher;