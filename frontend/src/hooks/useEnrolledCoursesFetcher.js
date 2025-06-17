// src/hooks/useEnrolledCoursesFetcher.js

import { useState, useEffect, useCallback } from 'react';

// You might need a utility for generating UUIDs
// npm install uuid
// import { v4 as uuidv4 } from 'uuid'; // Add this import if you use uuid library

/**
 * @typedef {Object} EnrolledCourse
 * @property {string} id - A **unique composite ID** for the enrolled course instance (programId-courseId or programId-generatedId).
 * @property {string | undefined} courseId - The original unique ID of the course from backend, might be undefined.
 * @property {string} programId - The ID of the program this course is part of.
 * @property {string} [programTitle] - The title of the program this course belongs to.
 * @property {string} [enrollmentDate] - The date the user enrolled in the program.
 * @property {string} [programClassLink] - The class link for the overall program, if any.
 * @property {string} imageUrl - URL for the course's image, defaults to empty string.
 * @property {string} title - The title of the course (mapped from 'name'), defaults to 'Untitled Course'.
 * @property {string} instructor - The instructor's name, defaults to 'Unknown Instructor' (if not provided by backend).
 * @property {number} progress - The user's progress in the course (0-100), defaults to 0.
 * @property {string} status - The enrollment status (e.g., 'active'), defaults to 'Not Started'.
 * @property {string} teachableLink - The link to the actual course content (mapped from 'classLink'), defaults to '#'.
 * @property {number} [classDuration] - Optional: Duration of the class in minutes.
 * @property {string} [difficulty] - Optional: Difficulty level of the course (e.g., 'Beginner', 'Advanced').
 * @property {string} [description] - Optional: Detailed description of the course.
 * @property {string} [classLink] - Optional: Original class link from API.
 */

const useEnrolledCoursesFetcher = (userId) => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loadingEnrolledCourses, setLoadingEnrolledCourses] = useState(true);
    const [enrolledCoursesError, setEnrolledCoursesError] = useState(null);

    const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL;

    const fetchEnrollments = useCallback(async () => {
        if (!userId) {
            console.warn("[useEnrolledCoursesFetcher] No user ID available. Skipping enrollment fetch.");
            setEnrolledCourses([]);
            setLoadingEnrolledCourses(false);
            setEnrolledCoursesError(null);
            return;
        }

        setLoadingEnrolledCourses(true);
        setEnrolledCoursesError(null);
        console.log(`[useEnrolledCoursesFetcher] Fetching enrollments for user: ${userId} from ${BACKEND_API_URL}/api/users/get-enrollments`);

        try {
            const response = await fetch(`${BACKEND_API_URL}/api/users/get-enrollments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${yourAuthToken}`,
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
                    console.warn('[useEnrolledCoursesFetcher] Could not parse error response as JSON:', jsonError);
                    errorDetail = `Server responded with status: ${response.status} but error details are unavailable.`;
                }
                throw new Error(`Failed to fetch enrollments: ${errorDetail}`);
            }

            const data = await response.json();
            console.log("[useEnrolledCoursesFetcher] Fetched raw enrollments data:", data);

            if (data && Array.isArray(data.enrollments)) {
                let allEnrolledCourses = [];

                data.enrollments.forEach(enrollment => {
                    if (enrollment.courses && Array.isArray(enrollment.courses)) {
                        const formattedCoursesForProgram = enrollment.courses.map((course, index) => {
                            // Determine the course's unique identifier.
                            // Prioritize backend-provided courseId.
                            // If missing, create a fallback using a combination of programId, course name, and index.
                            // A more robust solution for frontend-generated IDs would be a UUID library.
                            const uniqueCourseIdentifier = course.courseId || `${course.name || 'unknown-course'}-${index}`;
                            // If using 'uuid' library: const uniqueCourseIdentifier = course.courseId || uuidv4();

                            return {
                            
                                id: `${enrollment.programId}-${uniqueCourseIdentifier}`, 
                                courseId: course.courseId,
                                programId: enrollment.programId, 

                                programTitle: enrollment.programTitle,
                                enrollmentDate: enrollment.enrollmentDate,
                                programClassLink: enrollment.programClassLink,

                                imageUrl: course.imageUrl ?? '', 
                                title: course.name ?? 'Untitled Course',
                                instructor: course.instructor ?? 'Unknown Instructor',
                                progress: typeof course.progress === 'number' ? course.progress : 0,
                                status: course.status ?? 'Not Started',
                                teachableLink: course.classLink ?? '#',
                                
                                 duration: course.duration,
                                difficulty: course.difficulty,
                                description: course.description,
                            };
                        });
                        allEnrolledCourses = allEnrolledCourses.concat(formattedCoursesForProgram);
                    } else {
                        console.warn(`[useEnrolledCoursesFetcher] Enrollment ${enrollment.id || enrollment.programId} has no 'courses' array or it's invalid. Skipping courses for this enrollment.`);
                    }
                });
                
                setEnrolledCourses(allEnrolledCourses);
            } else {
                console.warn('[useEnrolledCoursesFetcher] API returned unexpected data structure: expected an "enrollments" array at the root.', data);
                setEnrolledCourses([]);
                throw new Error('Received invalid or empty data structure for enrollments from the server.');
            }
        } catch (err) {
            console.error("[useEnrolledCoursesFetcher] Error fetching enrolled courses:", err);
            setEnrolledCoursesError(`Failed to load enrolled courses: ${err.message}. Please try again.`);
            setEnrolledCourses([]);
        } finally {
            setLoadingEnrolledCourses(false);
        }
    }, [userId, BACKEND_API_URL]);

    useEffect(() => {
        fetchEnrollments();
    }, [fetchEnrollments]);

    return {
        enrolledCourses,
        loadingEnrolledCourses,
        enrolledCoursesError,
        refetchEnrolledCourses: fetchEnrollments
    };
};

export default useEnrolledCoursesFetcher;