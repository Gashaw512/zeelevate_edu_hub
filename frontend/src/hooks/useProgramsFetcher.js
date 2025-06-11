import { useState, useEffect, useCallback } from 'react';

// This custom hook encapsulates the logic for fetching program data.
const useProgramsFetcher = (backendApiUrl) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const apiUrl = `${backendApiUrl}/api/admin/public/courses`;
      console.info('Attempting to fetch programs from:', apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        let errorDetail = `Server responded with status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData === 'object' && errorData.message) {
            errorDetail = errorData.message;
          } else if (response.status === 404) {
            errorDetail = 'Programs endpoint not found.';
          } else {
            errorDetail = `Server responded with status: ${response.status}. Details: ${JSON.stringify(errorData)}`;
          }
        } catch (jsonError) {
          console.warn('Could not parse error response as JSON for status:', response.status, jsonError);
          // If JSON parsing fails, use the default status message.
        }
        throw new Error(`API request failed: ${errorDetail}`);
      }

      const rawData = await response.json();
      console.info('Successfully fetched raw program data.');

      // Validate the expected data structure for the overall response
      if (!rawData || !Array.isArray(rawData.courses)) {
        throw new Error('Invalid data structure received from API: "courses" array is missing or malformed.');
      }

      const transformedData = rawData.courses.map(course => {
        // Validate individual course properties
        if (!course || typeof course.courseId === 'undefined' || !course.courseTitle) {
          console.warn('Skipping malformed course object received from API:', course);
          return null; // Return null for malformed courses to be filtered out
        }

                const parsedPrice = parseFloat(course.price);
        const fixedPriceValue = isNaN(parsedPrice) ? 0 : parsedPrice; // Fallback to 0 if parsing fails

        return {
          id: course.courseId,
          name: course.courseTitle,
          shortDescription: course.courseDetails || 'No description available.',
          // Ensure fixedPrice is always a number
          fixedPrice: fixedPriceValue,
          courses: [{ id: course.courseId, name: course.courseTitle }],
        };
      }).filter(Boolean);

      setPrograms(transformedData);
      console.log('Programs data transformed and set:', transformedData);

    } catch (err) {
      console.error('Failed to fetch program data:', err);
      setError(`Failed to load program options: ${err.message}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  }, [backendApiUrl])

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]); // Effect runs when fetchPrograms changes (which is only if backendApiUrl changes)

  return { programs, loading, error, refetchPrograms: fetchPrograms };
};

export default useProgramsFetcher;