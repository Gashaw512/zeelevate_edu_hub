import { useState, useEffect, useCallback } from 'react';

const useEnrolledCoursesFetcher = (userId) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingEnrolledCourses, setLoadingEnrolledCourses] = useState(true);
  const [enrolledCoursesError, setEnrolledCoursesError] = useState(null);

  const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL;
  const isDev = process.env.NODE_ENV === 'development';

  const fetchEnrollments = useCallback(async () => {
    if (!userId) {
      if (isDev) console.warn("[useEnrolledCoursesFetcher] No user ID available. Skipping enrollment fetch.");
      setEnrolledCourses([]);
      setLoadingEnrolledCourses(false);
      setEnrolledCoursesError(null);
      return;
    }

    setLoadingEnrolledCourses(true);
    setEnrolledCoursesError(null);

    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/users/get-enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userId }),
        signal,
      });

      if (!response.ok) {
        let errorDetail = `Server responded with status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData?.message) errorDetail = errorData.message;
        } catch {
          if (isDev) console.warn('[useEnrolledCoursesFetcher] Could not parse error JSON.');
        }
        throw new Error(`Failed to fetch enrollments: ${errorDetail}`);
      }

      const data = await response.json();
      if (isDev) console.log("[useEnrolledCoursesFetcher] Fetched raw enrollments data:", data);

      if (data?.enrollments && Array.isArray(data.enrollments)) {
        const allEnrolledCourses = data.enrollments.flatMap(enrollment => {
          if (!Array.isArray(enrollment.courses)) {
            if (isDev) console.warn(`[useEnrolledCoursesFetcher] Invalid or missing 'courses' in enrollment ${enrollment.programId}`);
            return [];
          }
          return enrollment.courses.map((course, index) => {
            const uniqueCourseIdentifier = course.courseId || `${course.name || 'unknown-course'}-${index}`;
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
        });

        setEnrolledCourses(allEnrolledCourses);
      } else {
        setEnrolledCourses([]);
        throw new Error('Invalid or empty data structure from server.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setEnrolledCoursesError(`Failed to load enrolled courses: ${err.message}. Please try again.`);
        setEnrolledCourses([]);
        if (isDev) console.error("[useEnrolledCoursesFetcher] Error fetching enrolled courses:", err);
      }
    } finally {
      setLoadingEnrolledCourses(false);
    }

    return () => controller.abort();
  }, [userId, BACKEND_API_URL, isDev]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrolledCourses,
    loadingEnrolledCourses,
    enrolledCoursesError,
    refetchEnrolledCourses: fetchEnrollments,
  };
};

export default useEnrolledCoursesFetcher;
