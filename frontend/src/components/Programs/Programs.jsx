import { Link } from 'react-router-dom';
import styles from './Programs.module.css'; // Ensure your CSS module is correctly linked
import { usePrograms } from '../../context/ProgramsContext'; // Make sure this path is correct
import LoadingSpinner from '../../components/common/LoadingSpinner'; // Make sure this path is correct

/**
 * Programs Component
 * Displays a list of available learning programs, fetching data from ProgramsContext.
 * Handles loading, error, and empty states gracefully.
 */
const Programs = () => {
    // Destructure necessary state and functions from the ProgramsContext
    const { programs, allCourses, loadingPrograms, programsError, refetchPrograms } = usePrograms();

    /**
     * Calculates a monthly price based on the total price and duration in days.
     * Returns null if calculation is not possible or meaningful.
     *
     * @param {number} totalPrice - The total price of the program.
     * @param {number} durationDays - The duration of the program in days.
     * @returns {string | null} The calculated monthly price formatted to two decimal places, or null.
     */
    const calculateMonthlyPrice = (totalPrice, durationDays) => {
        // Validate totalPrice: Must be a positive number
        if (typeof totalPrice !== 'number' || isNaN(totalPrice) || totalPrice <= 0) {
            return null; // Cannot calculate monthly price without a valid total price
        }

        // Validate durationDays: Must be a positive number
        if (typeof durationDays !== 'number' || isNaN(durationDays) || durationDays <= 0) {
            // If duration is invalid, we cannot compute a meaningful monthly price.
            // Returning null is more accurate than an arbitrary fallback.
            console.warn(`calculateMonthlyPrice: Invalid durationDays (${durationDays}) provided for totalPrice ${totalPrice}. Returning null.`);
            return null;
        }

        // Calculate number of months directly from days (assuming 30 days per month for monthly pricing)
        const numberOfMonths = durationDays / 30;

        // Prevent division by zero if durationDays leads to zero months
        if (numberOfMonths === 0) {
            return null;
        }

        // Calculate price per month and format to two decimal places
        return (totalPrice / numberOfMonths).toFixed(2);
    };

    /**
     * Formats a date string into a user-friendly local date format.
     * @param {string | Date} dateValue - The date string or Date object to format.
     * @returns {string | null} Formatted date string, or null if input is invalid.
     */
    const formatDate = (dateValue) => {
        if (!dateValue) return null;
        try {
            const date = new Date(dateValue);
            // Check if the date is valid after parsing
            if (isNaN(date.getTime())) {
                console.warn(`formatDate: Invalid date value received: ${dateValue}`);
                return null;
            }
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString(undefined, options);
        } catch (error) {
            console.error("formatDate: Error formatting date:", dateValue, error);
            return null;
        }
    };

    /**
     * Determines the content for the program's action button, including the monthly price badge.
     * @param {string} status - The program's status (e.g., 'available', 'beta', 'inactive').
     * @param {number | null} actualProgramPrice - The total price of the program.
     * @param {number | null} durationDays - The duration of the program in days.
     * @returns {JSX.Element | string} The button content.
     */
    const getButtonContent = (status, actualProgramPrice, durationDays) => {
        const monthlyPrice = calculateMonthlyPrice(actualProgramPrice, durationDays);
        const priceBadge = monthlyPrice !== null ? (
            <span className={styles.buttonPrice}>${monthlyPrice}/mo</span>
        ) : null; // Only render badge if monthlyPrice is calculable

        switch (status) {
            case 'available':
                return <>Start Learning Now {priceBadge}</>;
            case 'beta':
                return <>Request Beta Access {priceBadge}</>;
            case 'inactive':
                return "Coming Soon";
            case 'full':
                return "Program Full";
            default:
                return "Learn More"; // Default fallback
        }
    };

    /**
     * Determines if the program's button should be an active link.
     * @param {string} status - The program's status.
     * @returns {boolean} True if the button should be an active link, false otherwise.
     */
    const isLinkActive = (status) => ['available', 'beta'].includes(status);

    // --- Conditional Rendering for Loading, Error, and Empty States ---
    if (loadingPrograms) {
        return (
            <section className={styles.programsSection} aria-live="polite">
                <div className={styles.sectionHeader}>
                    <h2 className={styles.mainHeading}>Loading Programs...</h2>
                    <p className={styles.sectionSubtitle}>Fetching our exciting learning paths for you.</p>
                </div>
                <div className={styles.statusMessageContainer}>
                    <LoadingSpinner message="Please wait..." />
                </div>
            </section>
        );
    }

    if (programsError) {
        return (
            <section className={styles.programsSection} aria-live="assertive">
                <div className={styles.sectionHeader}>
                    <h2 className={styles.mainHeading}>Failed to Load Programs</h2>
                    <p className={styles.sectionSubtitle}>We're sorry, an error occurred while fetching programs.</p>
                </div>
                <div className={styles.statusMessageContainer}>
                    <p className={styles.errorMessage}>{programsError}</p>
                    <button onClick={refetchPrograms} className={styles.retryButton}>
                        Retry Loading Programs
                    </button>
                </div>
            </section>
        );
    }

    if (!programs || programs.length === 0) {
        return (
            <section className={styles.programsSection} aria-live="polite">
                <div className={styles.sectionHeader}>
                    <h2 className={styles.mainHeading}>No Programs Available</h2>
                    <p className={styles.sectionSubtitle}>It looks like we don't have any programs listed right now. Please check back soon!</p>
                </div>
                <div className={styles.statusMessageContainer}>
                    {/* Optionally add an icon or illustration for empty state */}
                </div>
            </section>
        );
    }

    // --- Main Programs Grid Display ---
    return (
        <section className={styles.programsSection}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.mainHeading}>Transform Your Digital Future</h2>
                <p className={styles.sectionSubtitle}>Find the learning path that's right for you.</p>
            </div>

            <div className={styles.programsGrid}>
                {programs.map(program => {
                    // Ensure program.programId exists before using as key
                    console.log(program)
                    if (!program.programId) {
                        console.warn("Program missing programId, skipping:", program);
                        return null; // Skip rendering if essential ID is missing
                    }

                    // Filter courses included in this specific program based on 'programIds' array
                    const includedCourses = allCourses.filter(
                        c => Array.isArray(c.programIds) && c.programIds.includes(program.programId)
                    );
                    const activeLink = isLinkActive(program.status);

                    const actualTotalProgramPrice = program.price;
                    const formattedDeadline = formatDate(program.registrationDeadline);
                    const displayedMonthlyPrice = calculateMonthlyPrice(actualTotalProgramPrice, program.duration);

                    return (
                        <div key={program.programId} className={styles.programCard} role="region" aria-label={`Program: ${program.title}`}>
                            {program.badge && <div className={styles.programBadge}>{program.badge}</div>}

                            <div className={styles.cardHeader}>
                                <h3 className={styles.cardTitle}>{program.title || 'Untitled Program'}</h3>
                                <div className={styles.pricing}>
                                    {/* Display monthly price if available */}
                                    {displayedMonthlyPrice !== null ? (
                                        <div className={styles.monthlyPriceDisplay}>
                                            <span className={styles.currency}>$</span>
                                            <span className={styles.amount}>{displayedMonthlyPrice}</span>
                                            <span className={styles.duration}>/month</span>
                                        </div>
                                    ) : (
                                        // Fallback for when monthly price cannot be calculated
                                        <p className={styles.noMonthlyPrice}>Monthly pricing not available</p>
                                    )}

                                    {/* Display full payment price if available */}
                                    {actualTotalProgramPrice !== null && typeof actualTotalProgramPrice === 'number' && !isNaN(actualTotalProgramPrice) ? (
                                        <p className={styles.fullPaymentDisplay}>
                                            <span className={styles.fullPaymentLabel}>Full Payment:</span> ${actualTotalProgramPrice.toFixed(2)}
                                        </p>
                                    ) : (
                                        // Fallback for when total price is not available
                                        <p className={styles.noFullPrice}>Price details not available</p>
                                    )}
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                {formattedDeadline ? (
                                    <p className={styles.registrationDeadline}>
                                        <span className={styles.deadlineLabel}>Registration Deadline:</span> {formattedDeadline}
                                    </p>
                                ) : (
                                    <p className={styles.noDeadline}>No registration deadline specified.</p>
                                )}

                                <div className={styles.courseList}>
                                    <h4 className={styles.listHeading}>Included Courses:</h4>
                                    <ul>
                                        {includedCourses.length > 0
                                            ? includedCourses.map(c => (
                                                  <li key={c.courseId}>
                                                      <span className={styles.listMarker}>🔷</span>{c.name || 'Unnamed Course'}
                                                  </li>
                                              ))
                                            : <li className={styles.noCourseDetail}>No courses listed for this program.</li>
                                        }
                                    </ul>
                                </div>

                                <div className={styles.programFeatures}>
                                    <h4 className={styles.listHeading}>Features:</h4>
                                    <div className={styles.featuresGrid}>
                                        {program.features?.length > 0
                                            ? program.features.map((f, i) => (
                                                  <div key={i} className={styles.featureItem}>
                                                      <div className={styles.featureIcon}>✓</div>{f}
                                                  </div>
                                              ))
                                            : <p className={styles.noFeatureDetail}>No features listed for this program.</p>
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                {activeLink
                                    ? (
                                        <Link
                                            to={`/enroll/${program.programId}`}
                                            className={styles.enrollButton}
                                            onClick={() => {
                                                // Store program details in sessionStorage for the next page
                                                sessionStorage.setItem('programType', program.programId);
                                                sessionStorage.setItem('programFullPrice', actualTotalProgramPrice);
                                                // Consider using React Router's state prop for a more integrated approach:
                                                // history.push({ pathname: `/enroll/${program.programId}`, state: { programId: program.programId, fullPrice: actualTotalProgramPrice } });
                                            }}
                                        >
                                            {getButtonContent(program.status, actualTotalProgramPrice, program.duration)}
                                        </Link>
                                    ) : (
                                        <button className={`${styles.enrollButton} ${styles.disabledButton}`} disabled>
                                            {getButtonContent(program.status, actualTotalProgramPrice, program.duration)}
                                        </button>
                                    )
                                }
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Programs;