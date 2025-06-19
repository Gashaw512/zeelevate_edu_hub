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
      // --- FETCH PROGRAMS ---
      const programsApiUrl = `${backendApiUrl}/api/admin/public/programs`;
      console.info('Attempting to fetch programs from:', programsApiUrl);
      const programsResponse = await fetch(programsApiUrl);

      if (!programsResponse.ok) {
        let errorDetail = `HTTP error! Status: ${programsResponse.status}`;
        try {
          const errorData = await programsResponse.json();
          if (errorData && errorData.message) {
            errorDetail = errorData.message;
          }
        } catch (jsonError) {
          console.warn('Could not parse error response as JSON for programs (status was not OK):', jsonError);
        }
        throw new Error(`Failed to load programs: ${errorDetail}`);
      }
      
      const rawProgramsResponseData = await programsResponse.json(); 
      const programsArray = rawProgramsResponseData.programs; 

      if (!Array.isArray(programsArray)) {
          console.error("API response structure for /admin/public/programs was unexpected. Expected 'programs' property to be an array. Received:", rawProgramsResponseData);
          setError("Invalid data format for programs. Please try again later.");
          setPrograms([]); 
          return;
      }

      // --- CRITICAL FIX: CONVERT PROGRAM PRICES TO NUMBERS HERE ---
      const processedPrograms = programsArray.map(program => ({
          ...program,
          // Ensure price is converted to a number.
          // Using Number() is generally robust. parseFloat() can also be used.
          // If price might be missing or null, add a fallback, though PropTypes should catch it.
          price: typeof program.price === 'string' || typeof program.price === 'number'
                 ? Number(program.price) // Convert if string or just keep if number
                 : 0 // Default to 0 if price is null, undefined, or other unexpected type
      }));

      console.info('Programs fetched and processed successfully:', processedPrograms);
      setPrograms(processedPrograms); // Set the state with the processed array of programs

      // --- FETCH ALL PUBLIC COURSES ---
      const coursesApiUrl = `${backendApiUrl}/api/admin/public/courses`;
      console.info('Attempting to fetch all public courses from:', coursesApiUrl);
      const coursesResponse = await fetch(coursesApiUrl);

      if (!coursesResponse.ok) {
        let errorDetail = `HTTP error! Status: ${coursesResponse.status}`;
        try {
          const errorData = await coursesResponse.json();
          if (errorData && errorData.message) {
            errorDetail = errorData.message;
          }
        } catch (jsonError) {
          console.warn('Could not parse error response as JSON for courses (status was not OK):', jsonError);
        }
        throw new Error(`Failed to load courses: ${errorDetail}`);
      }
      
      const rawCoursesResponseData = await coursesResponse.json(); 
      const coursesArray = rawCoursesResponseData.courses; 

      if (!Array.isArray(coursesArray)) {
          console.error("API response structure for /admin/public/courses was unexpected. Expected 'courses' property to be an array. Received:", rawCoursesResponseData);
          setError("Invalid data format for courses. Please try again later.");
          setAllCourses([]);
          return;
      }

      const processedCourses = coursesArray.map(course => ({
          ...course,
          name: course.name || course.courseTitle || '' // Uses 'name' field from your Firebase course schema
      }));
      setAllCourses(processedCourses);

    } catch (err) {
      console.error('Error in useProgramsFetcher:', err);
      setError(err.message || "An unexpected error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  }, [backendApiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { programs, allCourses, loading, error, refetchPrograms: fetchData };
};

export default useProgramsFetcher;