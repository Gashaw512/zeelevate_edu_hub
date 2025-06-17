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
      
      // --- CRITICAL CORRECTION FOR PROGRAMS DATA STRUCTURE ---
      const rawProgramsResponseData = await programsResponse.json(); 
      // Expecting a structure like: { success: true, programs: [...] }
      const programsArray = rawProgramsResponseData.programs; 

      console.info('Programs fetched successfully:', programsArray);

      // Validate if the 'programs' property is an array
      if (!Array.isArray(programsArray)) {
          console.error("API response structure for /admin/public/programs was unexpected. Expected 'programs' property to be an array. Received:", rawProgramsResponseData);
          setError("Invalid data format for programs. Please try again later.");
          setPrograms([]); // Ensure it's an array to prevent further errors
          return; // Exit if programs data is malformed
      }
      setPrograms(programsArray); // Set the state with the actual array of programs

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
      console.info('All public courses fetched successfully:', rawCoursesResponseData);
      // Expecting a structure like: { success: true, courses: [...] }
      const coursesArray = rawCoursesResponseData.courses; 

      console.info('Courses fetched successfully:', coursesArray);
      // Validate if the 'courses' property is an array
      if (!Array.isArray(coursesArray)) {
          console.error("API response structure for /admin/public/courses was unexpected. Expected 'courses' property to be an array. Received:", rawCoursesResponseData);
          setError("Invalid data format for courses. Please try again later.");
          setAllCourses([]); // Ensure it's an array to prevent further errors
          return; // Exit if courses data is malformed
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