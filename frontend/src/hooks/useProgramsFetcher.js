// src/hooks/useProgramsFetcher.js
import { useState, useEffect, useCallback } from 'react';

const useProgramsFetcher = (backendApiUrl) => {
  const [programs, setPrograms] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // --- Fetch Public Programs ---
      const programsRes = await fetch(`${backendApiUrl}/api/admin/public/programs`);
      if (!programsRes.ok) {
        const { message } = await programsRes.json().catch(() => ({}));
        throw new Error(`Failed to load programs: ${message || programsRes.statusText}`);
      }

      const { programs: rawPrograms } = await programsRes.json();
      if (!Array.isArray(rawPrograms)) {
        throw new Error("Invalid format: 'programs' should be an array.");
      }

      const processedPrograms = rawPrograms.map(program => ({
        ...program,
        price: typeof program.price === 'string' || typeof program.price === 'number'
          ? Number(program.price)
          : 0,
      }));

      setPrograms(processedPrograms);

      // --- Fetch Public Courses ---
      const coursesRes = await fetch(`${backendApiUrl}/api/admin/public/courses`);
      if (!coursesRes.ok) {
        const { message } = await coursesRes.json().catch(() => ({}));
        throw new Error(`Failed to load courses: ${message || coursesRes.statusText}`);
      }

      const { courses: rawCourses } = await coursesRes.json();
      if (!Array.isArray(rawCourses)) {
        throw new Error("Invalid format: 'courses' should be an array.");
      }

      const processedCourses = rawCourses.map(course => ({
        ...course,
        name: course.name || course.courseTitle || '',
      }));

      setAllCourses(processedCourses);

    } catch (err) {
      console.error('[useProgramsFetcher] Fetch Error:', err);
      setError(err.message || 'An unexpected error occurred while loading programs or courses.');
      setPrograms([]);
      setAllCourses([]);
    } finally {
      setLoading(false);
    }
  }, [backendApiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    programs,
    allCourses,
    loading,
    error,
    refetchPrograms: fetchData,
  };
};

export default useProgramsFetcher;
