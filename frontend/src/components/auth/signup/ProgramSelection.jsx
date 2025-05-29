
import PropTypes from "prop-types"; // Recommended for type checking props
import { Link } from "react-router-dom"; // Assuming you use react-router-dom for /courses link
import styles from "./ProgramSelection.module.css"; // Import the CSS Module

const ProgramSelection = ({
  programs,
  selectedProgramIds,
  onProgramSelect,
  calculateTotalPrice,
}) => {
  return (
    <div className={styles.programSelectionSection}>
      <h3 className={styles.sectionTitle}>Step 1: Choose Your Program Modules</h3>
      <p className={styles.sectionDescription}>
        Select the programs that best fit your learning goals. You can pick one
        or more.
      </p>

      <div className={styles.programCardsContainer}>
        {programs.map((program) => (
          <div
            key={program.id}
            // Use template literals for conditional classes with CSS Modules
            className={`${styles.programCard} ${
              selectedProgramIds.includes(program.id) ? styles.selected : ""
            }`}
            onClick={() => onProgramSelect(program.id)}
            tabIndex="0"
            role="checkbox"
            aria-checked={selectedProgramIds.includes(program.id)}
          >
            <div className={styles.programHeaderSelection}>
              {/* Using a custom checkbox for better styling control and consistent look */}
              <div className={styles.customCheckbox}>
                <input
                  type="checkbox"
                  id={program.id}
                  checked={selectedProgramIds.includes(program.id)}
                  onChange={() => onProgramSelect(program.id)}
                  onClick={(e) => e.stopPropagation()} // Prevent card's onClick from firing twice
                  className={styles.visuallyHidden} // Hide native checkbox
                />
                <span className={styles.checkboxIndicator} aria-hidden="true"></span>
              </div>

              <label htmlFor={program.id} className={styles.programTitleLabel}>
                <h4 className={styles.programName}>{program.name}</h4>
              </label>
            </div>

            <p className={styles.programShortDescription}>
              {program.shortDescription}
            </p>

            <div className={styles.programDetailsSummary}>
              <div className={styles.programCoursesIncluded}>
                <h5>What's Included:</h5>
                <ul>
                  {program.courses.map((course) => (
                    <li key={course.id}>{course.name}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.programCardFooter}>
              <span className={styles.programPriceLabel}>Program Price:</span>
              <span className={styles.programPriceAmount}>
                ${program.fixedPrice.toFixed(2)}
              </span>
            </div>

            {selectedProgramIds.includes(program.id) && (
              <div className={styles.cardSelectedOverlay} aria-hidden="true">
                <svg
                  className={styles.checkIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.totalSummaryArea}>
        <p className={styles.totalPriceLabel}>Total Enrollment Cost:</p>
        <p className={styles.totalPriceAmount}>
          ${calculateTotalPrice().toFixed(2)}
        </p>
      </div>

      <div className={styles.viewAllCoursesContainer}>
        <p className={styles.viewCoursesText}>
          Want to see a full breakdown of each program's content?
        </p>
        <Link to="/courses" className={styles.viewAllCoursesLink}>
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
            <polyline points="12 5 19 12 12 19"></polyline>
            <line x1="19" y1="12" x2="5" y2="12"></line>
          </svg>
        </Link>
      </div>
    </div>
  );
};

// Add PropTypes for better development and debugging
ProgramSelection.propTypes = {
  programs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      shortDescription: PropTypes.string.isRequired,
      fixedPrice: PropTypes.number.isRequired,
      courses: PropTypes.array.isRequired, // courses should be an array of objects if they have id/name
    })
  ).isRequired,
  selectedProgramIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onProgramSelect: PropTypes.func.isRequired,
  calculateTotalPrice: PropTypes.func.isRequired,
};

export default ProgramSelection;
