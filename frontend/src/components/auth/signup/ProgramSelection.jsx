// src/components/SignUp/ProgramSelection/ProgramSelection.jsx
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styles from "./ProgramSelection.module.css";
import React from 'react'; // Explicitly import React for functional components

/**
 * ProgramSelection Component
 * Displays a list of programs for selection, allowing a single program to be chosen.
 * It integrates with SignUp.jsx to manage program selection state.
 */
const ProgramSelection = ({
  programs,          // Array of program objects, each including a 'courses' array
  selectedProgramIds, // Array of currently selected program IDs (expected to be single-element or empty)
  onProgramSelect,   // Callback function to handle program selection/deselection
  totalPrice,        // Calculated total price of selected programs
}) => {
  /**
   * Determines if a program card should be clickable/selectable based on its status.
   * @param {string} status - The status of the program (e.g., 'available', 'beta', 'unavailable', 'full').
   * @returns {boolean} True if the program can be selected, false otherwise.
   */
  const isProgramSelectable = (status) => {
    // Only 'available' and 'beta' programs can be selected for now.
    return status === 'available' || status === 'beta';
  };

  /**
   * Handles click events on the checkbox input.
   * Prevents event propagation to avoid double-triggering from parent div's onClick.
   * @param {Object} e - The event object.
   * @param {string} programId - The ID of the program associated with the checkbox.
   * @param {string} status - The status of the program.
   */
  const handleCheckboxClick = (e, programId, status) => {
    e.stopPropagation(); // Prevent the parent div's onClick from firing simultaneously
    if (isProgramSelectable(status)) {
      onProgramSelect(programId);
    }
    // Else, do nothing if not selectable
  };

  /**
   * Handles click events on the program card itself.
   * @param {string} programId - The ID of the program associated with the card.
   * @param {string} status - The status of the program.
   */
  const handleCardClick = (programId, status) => {
    if (isProgramSelectable(status)) {
      onProgramSelect(programId);
    }
    // Else, do nothing if not selectable
  };


  return (
    <div className={styles.programSelectionSection}>
      <div className={styles.programCardsContainer}>
        {/* Render a program card for each program in the 'programs' array */}
        {programs.map((program) => {
          // Determine if the current program is selected
          const isSelected = selectedProgramIds.includes(program.programId);
          const selectable = isProgramSelectable(program.status); // Determine selectability

          return (
            <div
              key={program.programId} // Unique key for list rendering, using programId
              className={`${styles.programCard} ${isSelected ? styles.selected : ""} ${
                !selectable ? styles.unselectable : "" // Apply unselectable style
              }`}
              // Allow clicking anywhere on the card to select/deselect the program
              onClick={() => handleCardClick(program.programId, program.status)} // Use new handler
              tabIndex={selectable ? "0" : "-1"} // Only focusable if selectable
              role="checkbox" // Indicate that this div acts like a checkbox
              aria-checked={isSelected} // Announce selection status for accessibility
              aria-disabled={!selectable} // Announce disabled state for accessibility
            >
              {/* Badge (e.g., 'Popular', 'New') */}
              {program.badge && (
                <div className={styles.programBadge}>
                  {program.badge}
                </div>
              )}

              <div className={styles.programHeaderSelection}>
                <div className={styles.customCheckbox}>
                  <input
                    type="checkbox"
                    id={`program-checkbox-${program.programId}`} // Unique ID for accessibility label
                    checked={isSelected}
                    onChange={(e) => handleCheckboxClick(e, program.programId, program.status)} // Use new handler
                    className={styles.visuallyHidden} // Hide native checkbox visually
                    disabled={!selectable} // Disable the native checkbox
                  />
                  <span
                    className={styles.checkboxIndicator}
                    aria-hidden="true" // Hide from accessibility tree as it's a visual indicator
                  />
                </div>

                <label
                  htmlFor={`program-checkbox-${program.programId}`} // Associate label with the hidden input
                  className={styles.programTitleLabel}
                >
                  <h4 className={styles.programName}>{program.title}</h4>
                </label>
              </div>

              <p className={styles.programShortDescription}>
                {program.shortDescription || 'No description available.'}
              </p>

              <div className={styles.programDetailsSummary}>
                <div className={styles.programCoursesIncluded}>
                  <h5>What's Included:</h5>
                  <ul>
                    {/* Conditionally render courses or a fallback message */}
                    {program.courses && program.courses.length > 0 ? (
                      program.courses.map((course) => (
                        <li key={course.courseId}>
                          {course.name}
                        </li>
                      ))
                    ) : (
                      <li>No specific courses listed for this program.</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className={styles.programCardFooter}>
                <span className={styles.programPriceLabel}>Program Price:</span>
                <span className={styles.programPriceAmount}>
                  {/* Safely display price, defaulting to 0.00 if undefined/null */}
                  {/* Use 'Coming Soon' or 'N/A' for unavailable/full programs */}
                  {selectable ? `$${(program.price ?? 0).toFixed(2)}` : 'N/A'}
                </span>
              </div>

              {/* Display a checkmark overlay when the card is selected */}
              {isSelected && (
                <div className={styles.cardSelectedOverlay} aria-hidden="true">
                  <CheckIcon />
                </div>
              )}

              {/* NEW: Overlay for unselectable programs */}
              {!selectable && (
                <div className={styles.unselectableOverlay}>
                  <p className={styles.unselectableText}>
                    {program.status === 'unavailable' ? 'Coming Soon' :
                     program.status === 'full' ? 'Program Full' :
                     'Not Available'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary of total price for selected programs */}
      <TotalSummary price={totalPrice} />

      {/* Link to view all courses details (assumed to be on homepage) */}
      <ViewAllCoursesLink />
    </div>
  );
};

// --- Helper Components (Kept as is, they are well-defined) ---

const CheckIcon = () => (
  <svg
    className={styles.checkIcon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TotalSummary = ({ price }) => (
  <div className={styles.totalSummaryArea}>
    <p className={styles.totalPriceLabel}>Total Enrollment Cost:</p>
    <p className={styles.totalPriceAmount}>${price.toFixed(2)}</p>
  </div>
);

TotalSummary.propTypes = {
  price: PropTypes.number.isRequired,
};

const ViewAllCoursesLink = () => {
  return (
    <div className={styles.viewAllCoursesContainer}>
      <p className={styles.viewCoursesText}>
        Want to see a full breakdown of each program's content?
      </p>
      <Link
        to="/"
        state={{ scrollTo: "service" }} // Assuming 'service' is an ID on your homepage section
        className={styles.viewAllCoursesLink}
      >
        View All Courses & Details
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.linkArrow}
        >
          <polyline points="12 5 19 12 12 19" />
          <line x1="19" y1="12" x2="5" y2="12" />
        </svg>
      </Link>
    </div>
  );
};

// --- PropTypes for ProgramSelection (Refined for precision) ---
ProgramSelection.propTypes = {
  programs: PropTypes.arrayOf(
    PropTypes.shape({
      programId: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      shortDescription: PropTypes.string, // Optional description
      price: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired, // Ensure status is always provided
      courses: PropTypes.arrayOf(
        PropTypes.shape({
          courseId: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
        })
      ).isRequired, // Ensure 'courses' array is present and is an array of course objects
    })
  ).isRequired,
  selectedProgramIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onProgramSelect: PropTypes.func.isRequired,
  totalPrice: PropTypes.number.isRequired, // totalPrice is always a number from SignUp's useMemo
};

export default ProgramSelection;