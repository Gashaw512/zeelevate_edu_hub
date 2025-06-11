// src/hooks/useEnrolledCoursesFetcher.js
import { useState, useEffect, useCallback } from 'react';

const useEnrolledCoursesFetcher = (userId) => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loadingEnrollments, setLoadingEnrollments] = useState(true);
    const [enrollmentsError, setEnrollmentsError] = useState(null);

    const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL;

    const fetchEnrollments = useCallback(async () => {
        if (!userId) {
            console.warn("useEnrolledCoursesFetcher: No user ID available. Skipping fetch.");
            setEnrolledCourses([]);
            setLoadingEnrollments(false);
            setEnrollmentsError(null);
            return;
        }

        setLoadingEnrollments(true);
        setEnrollmentsError(null); // Clear previous errors
        console.log(`Fetching enrollments for user: ${userId} from ${BACKEND_API_URL}/api/users/get-enrollments`);

        try {
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
            console.log("Fetched enrollments data:", data);
            if (data && Array.isArray(data.enrollments)) {
                const formattedEnrollments = data.enrollments.map(course => {
                    return {
                        id: course.id,
                        imageUrl: course.imageUrl || '',
                        title: course.course_title || 'Untitled Course',
                        instructor: course.instructor || 'Unknown Instructor', // Assuming 'instructor' field exists or needs a default
                        progress: typeof course.progress === 'number' ? course.progress : 0,
                        status: course.status || 'Not Started',
                        // FIX: Map 'classLink' from API to 'teachableLink' prop for CourseCard
                        teachableLink: course.classLink || '#', // <--- This is the key change!
                        // Include any other properties you want to keep or use from the API response
                        classDuration: course.classDuration,
                        classLink: course.classLink, // Keep the original for completeness if needed elsewhere
                        classStartDate: course.classStartDate,
                        courseDetails: course.courseDetails,
                        course_id: course.course_id,
                        expiry: course.expiry,
                    };
                });
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

    return {
        enrolledCourses,
        loadingEnrolledCourses: loadingEnrollments,
        enrolledCoursesError: enrollmentsError,
        refetchEnrolledCourses: fetchEnrollments
    };
};

export default useEnrolledCoursesFetcher;