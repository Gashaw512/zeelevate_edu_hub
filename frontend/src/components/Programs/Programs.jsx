import { Link } from 'react-router-dom';
import styles from './Programs.module.css';
import DUMMY_PROGRAM_DATA from '../../data/program'

const Programs = () => {
  
  const programs = DUMMY_PROGRAM_DATA;

  const getButtonContent = (programStatus, programPrice) => {
    switch (programStatus) {
      case 'available':
        return (
          <>
            Start Learning Now
            <span className={styles.buttonPrice}>${programPrice}/mo</span>
          </>
        );
      case 'unavailable':
        return "Courses Coming Soon";
      case 'full':
        return "Program Full";
      case 'beta': // Example of another status
        return "Join Beta Waitlist";
      default:
        return "Learn More";
    }
  };

  const isLinkActive = (programStatus) => programStatus === 'available' || programStatus === 'beta'; // Allow beta to be clickable

  return (
    <section className={styles.programsSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.mainHeading}>Transform Your Digital Future</h2>
        <p className={styles.sectionSubtitle}>Choose the learning path that's right for you at Zeelevate Academy.</p>
      </div>

      <div className={styles.programsGrid}>
        {/* Map over the DUMMY_PROGRAM_DATA array */}
        {programs.map((program) => (
          <div key={program.id} className={styles.programCard}> {/* Use program.id from dummy data */}
            {program.badge && (
              <div className={styles.programBadge}>
                {program.badge}
              </div>
            )}
            
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{program.title}</h3>
              <div className={styles.pricing}>
                <div className={styles.priceMain}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>{program.price}</span>
                  <span className={styles.duration}>/month</span>
                </div>
                <p className={styles.fullCourse}>
                  or ${program.fullPrice} for the full course
                </p>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.courseList}>
                <h4 className={styles.listHeading}>Included Courses:</h4>
                <ul>
                  {program.courses.map((course, index) => (
                    <li key={index}>
                      <span className={styles.listMarker}>🔷</span>
                      {course}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.programFeatures}>
                <h4 className={styles.listHeading}>Program Features:</h4>
                <div className={styles.featuresGrid}>
                  {program.features.map((feature, index) => (
                    <div key={index} className={styles.featureItem}>
                      <div className={styles.featureIcon}>✓</div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
              {isLinkActive(program.status) ? (
                <Link
                  to={`/enroll/${program.id}`} // Use program.id for the route
                  className={styles.enrollButton}
                  onClick={() => sessionStorage.setItem('programType', program.id)} // Store program.id
                >
                  {getButtonContent(program.status, program.price)}
                </Link>
              ) : (
                // Use a button element when not active for proper semantics
                <button
                  className={`${styles.enrollButton} ${styles.disabledButton}`}
                  disabled
                >
                  {getButtonContent(program.status, program.price)}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Programs;

// When The backend implemented this one will be uncommented

// src/components/Programs/Programs.jsx

// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import PropTypes from 'prop-types'; // Import PropTypes for type checking
// import styles from './Programs.module.css';

// // --- Program Card Component (Highly Recommended for Modularity) ---
// // For a highly professional setup, you would typically extract the ProgramCard
// // into its own separate component (e.g., components/ProgramCard/ProgramCard.jsx).
// // This improves reusability, readability, and separation of concerns.
// // For now, it's kept inline to show the complete picture, but keep this in mind.

// // Define the shape of a single program object for PropTypes
// const programShape = PropTypes.shape({
//   id: PropTypes.string.isRequired,
//   title: PropTypes.string.isRequired,
//   price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//   fullPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//   courses: PropTypes.arrayOf(PropTypes.string), // Array of strings, optional
//   features: PropTypes.arrayOf(PropTypes.string), // Array of strings, optional
//   badge: PropTypes.string, // Optional string (can contain emojis)
//   status: PropTypes.oneOf(['available', 'unavailable', 'full', 'beta', 'onhold']).isRequired, // Enforce specific status values
// });

// const Programs = () => {
//   // State variables for data, loading status, and potential errors
//   const [programs, setPrograms] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [retryAttempt, setRetryAttempt] = useState(0); // For retry functionality

//   /**
//    * Determines the content for the action button based on program status and price.
//    * @param {string} programStatus - The current status of the program (e.g., 'available', 'unavailable').
//    * @param {string | number} programPrice - The monthly price of the program.
//    * @returns {JSX.Element | string} The content to display inside the button.
//    */
//   const getButtonContent = (programStatus, programPrice) => {
//     switch (programStatus) {
//       case 'available':
//         return (
//           <>
//             Start Learning Now
//             <span className={styles.buttonPrice}>${programPrice}/mo</span>
//           </>
//         );
//       case 'unavailable':
//         return "Courses Coming Soon";
//       case 'full':
//         return "Program Full";
//       case 'beta':
//         return "Join Beta Waitlist";
//       case 'onhold':
//         return "Enrollment On Hold";
//       default:
//         // Fallback for unexpected statuses, ensuring a default action
//         console.warn(`Unknown program status: ${programStatus}. Defaulting to 'Learn More'.`);
//         return "Learn More";
//     }
//   };

//   /**
//    * Determines if the enrollment link/button should be active (clickable).
//    * @param {string} programStatus - The current status of the program.
//    * @returns {boolean} True if the link/button should be active, false otherwise.
//    */
//   const isLinkActive = (programStatus) =>
//     programStatus === 'available' || programStatus === 'beta'; // Allow 'beta' programs to be clickable for waitlist/early access

//   /**
//    * Fetches program data from the backend API.
//    * This function is encapsulated within useEffect to manage side effects.
//    */
//   useEffect(() => {
//     const fetchPrograms = async () => {
//       setIsLoading(true); // Set loading true at the start of fetch attempt
//       setError(null);    // Clear any previous errors

//       try {
//         // Use a more robust API endpoint management (e.g., environment variable in real app)
//         const response = await fetch('/api/programs');

//         // Check if the HTTP response was successful (status code 200-299)
//         if (!response.ok) {
//           // Attempt to parse error message from response body if available
//           const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
//           throw new Error(`HTTP error! Status: ${response.status} - ${errorData.message || response.statusText}`);
//         }

//         // Parse the JSON data from the response
//         const data = await response.json();

//         // Validate the structure of the fetched data
//         if (!Array.isArray(data)) {
//           throw new Error("API response is not an array. Expected program list.");
//         }

//         // Set the fetched data to state
//         setPrograms(data);

//       } catch (err) {
//         // Catch any errors during the fetch or parsing process
//         console.error("Failed to fetch programs:", err);
//         setError(err); // Store the error object for display
//       } finally {
//         setIsLoading(false); // Always set loading to false after the fetch attempt
//       }
//     };

//     fetchPrograms();
//     // The empty dependency array [] ensures this effect runs only once after the initial render.
//     // `retryAttempt` is added to re-run the effect if the user clicks retry.
//   }, [retryAttempt]); 

//   // --- Conditional Rendering for Different States ---

//   // 1. Loading State: Display while data is being fetched
//   if (isLoading) {
//     return (
//       <section className={styles.programsSection}>
//         <div className={styles.sectionHeader}>
//           <h2 className={styles.mainHeading}>Loading Our Programs...</h2>
//           <p className={styles.sectionSubtitle}>Please wait a moment while we retrieve the latest courses.</p>
//         </div>
//         <div className={styles.loadingMessage}>
//           {/* A simple loading indicator, you can replace with a spinner */}
//           <div className={styles.spinner}></div> Fetching courses...
//         </div>
//       </section>
//     );
//   }

//   // 2. Error State: Display if an error occurred during fetching
//   if (error) {
//     return (
//       <section className={styles.programsSection}>
//         <div className={styles.sectionHeader}>
//           <h2 className={styles.mainHeading}>Failed to Load Programs!</h2>
//           <p className={styles.sectionSubtitle}>
//             We're sorry, there was an issue fetching the course offerings.
//             Please try again later.
//           </p>
//           <div className={styles.errorMessage}>
//             Error details: {error.message || 'Unknown error occurred.'}
//           </div>
//           {/* Retry mechanism for user convenience */}
//           <button onClick={() => setRetryAttempt(prev => prev + 1)} className={styles.retryButton}>
//             Try Again
//           </button>
//         </div>
//       </section>
//     );
//   }

//   // 3. Empty State: Display if no programs are returned after successful fetch
//   if (programs.length === 0) {
//     return (
//       <section className={styles.programsSection}>
//         <div className={styles.sectionHeader}>
//           <h2 className={styles.mainHeading}>No Programs Available Yet</h2>
//           <p className={styles.sectionSubtitle}>
//             Our course catalog is currently being updated. Please check back soon for exciting new programs!
//           </p>
//         </div>
//       </section>
//     );
//   }

//   // 4. Data Loaded State: Render programs once data is successfully fetched
//   return (
//     <section className={styles.programsSection}>
//       <div className={styles.sectionHeader}>
//         <h2 className={styles.mainHeading}>Transform Your Digital Future</h2>
//         <p className={styles.sectionSubtitle}>Choose the learning path that's right for you at Zeelevate Academy.</p>
//       </div>

//       <div className={styles.programsGrid}>
//         {programs.map((program) => (
//           // Use `program.id` as the unique key, crucial for list rendering performance
//           <div key={program.id} className={styles.programCard}>
//             {/* Display optional badge if available */}
//             {program.badge && (
//               <div className={styles.programBadge}>
//                 {program.badge}
//               </div>
//             )}
            
//             <div className={styles.cardHeader}>
//               <h3 className={styles.cardTitle}>{program.title}</h3>
//               <div className={styles.pricing}>
//                 <div className={styles.priceMain}>
//                   <span className={styles.currency}>$</span>
//                   {/* Use optional chaining to safely access properties */}
//                   <span className={styles.amount}>{program.price?.toFixed(2)}</span>
//                   <span className={styles.duration}>/month</span>
//                 </div>
//                 <p className={styles.fullCourse}>
//                   or ${program.fullPrice?.toFixed(2)} for the full course
//                 </p>
//               </div>
//             </div>

//             <div className={styles.cardBody}>
//               <div className={styles.courseList}>
//                 <h4 className={styles.listHeading}>Included Courses:</h4>
//                 <ul>
//                   {/* Conditionally render courses if the array exists and has items */}
//                   {program.courses?.length > 0 ? (
//                     program.courses.map((course, index) => (
//                       <li key={index}> {/* index as key is acceptable here since courses within a program likely won't reorder */}
//                         <span className={styles.listMarker}>🔷</span>
//                         {course}
//                       </li>
//                     ))
//                   ) : (
//                     <li>No courses listed yet.</li>
//                   )}
//                 </ul>
//               </div>

//               <div className={styles.programFeatures}>
//                 <h4 className={styles.listHeading}>Program Features:</h4>
//                 <div className={styles.featuresGrid}>
//                   {/* Conditionally render features if the array exists and has items */}
//                   {program.features?.length > 0 ? (
//                     program.features.map((feature, index) => (
//                       <div key={index} className={styles.featureItem}>
//                         <div className={styles.featureIcon}>✓</div>
//                         <span>{feature}</span>
//                       </div>
//                     ))
//                   ) : (
//                     <div className={styles.noFeatures}>No specific features listed.</div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className={styles.cardFooter}>
//               {isLinkActive(program.status) ? (
//                 <Link
//                   to={`/enroll/${program.id}`} // Dynamic route based on program ID
//                   className={styles.enrollButton}
//                   // Store program ID in sessionStorage for potential use on enrollment page
//                   onClick={() => sessionStorage.setItem('programIdForEnrollment', program.id)}
//                 >
//                   {getButtonContent(program.status, program.price)}
//                 </Link>
//               ) : (
//                 <button
//                   className={`${styles.enrollButton} ${styles.disabledButton}`}
//                   disabled // Disable button if not active
//                 >
//                   {getButtonContent(program.status, program.price)}
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// // --- Prop Types for the Programs Component (Optional but Good Practice) ---
// // Although Programs component doesn't receive props from parent,
// // defining programShape makes it clear what the 'programs' data structure should look like.
// Programs.propTypes = {
//   // programs: PropTypes.arrayOf(programShape).isRequired, // If programs were passed as a prop
// };

// export default Programs;
