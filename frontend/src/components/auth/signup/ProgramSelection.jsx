import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styles from "./ProgramSelection.module.css";

// MOCK_PROGRAMS is no longer needed here as data comes from props.

const ProgramSelection = ({
  programs, // These are now the fetched and transformed programs from SignUp
  selectedProgramIds,
  onProgramSelect,
  totalPrice, // totalPrice is now passed directly, calculateTotalPrice is removed
}) => {
  // Use totalPrice directly, it's already calculated in SignUp based on fetched data
  const computedTotal = totalPrice; 

  const handleCheckboxClick = (e, programId) => {
    e.stopPropagation(); // Prevent card onClick from firing twice
    onProgramSelect(programId);
  };

  return (
    <div className={styles.programSelectionSection}>
      <h3 className={styles.sectionTitle}>
        Step 1: Choose Your Program Modules
      </h3>
      <p className={styles.sectionDescription}>
        Select the programs that best fit your learning goals.
      </p>

      <div className={styles.programCardsContainer}>
        {programs.map((program) => { 
          const isSelected = selectedProgramIds.includes(program.id);

          return (
            <div
              key={program.id}
              className={`${styles.programCard} ${
                isSelected ? styles.selected : ""
              }`}
              onClick={() => onProgramSelect(program.id)}
              tabIndex="0"
              role="checkbox"
              aria-checked={isSelected}
            >
              <div className={styles.programHeaderSelection}>
                <div className={styles.customCheckbox}>
                  <input
                    type="checkbox"
                    id={program.id}
                    checked={isSelected}
                    onChange={(e) => handleCheckboxClick(e, program.id)}
                    className={styles.visuallyHidden} // Hide actual checkbox, use custom indicator
                  />
                  <span
                    className={styles.checkboxIndicator}
                    aria-hidden="true" // Visually indicates selection
                  />
                </div>

                <label
                  htmlFor={program.id}
                  className={styles.programTitleLabel}
                >
                  {/* Access program.name as it's mapped from courseTitle in SignUp */}
                  <h4 className={styles.programName}>{program.name}</h4> 
                </label>
              </div>

              {/* Access program.shortDescription as mapped from courseDetails in SignUp */}
              <p className={styles.programShortDescription}>
                {program.shortDescription}
              </p>

              <div className={styles.programDetailsSummary}>
                <div className={styles.programCoursesIncluded}>
                  <h5>What's Included:</h5>
                  <ul>
                    {/* Access program.courses (which is an array of {id, name} objects from SignUp's mapping) */}
                    {program.courses.map((course) => (
                       /* Use course.id for key if available, else course.name */
                      <li key={course.id || course.name}>{course.name}</li> 
                     
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.programCardFooter}>
                <span className={styles.programPriceLabel}>Program Price:</span>
                {/* Access program.fixedPrice as mapped from price in SignUp */}
                <span className={styles.programPriceAmount}>
                  {/* ${program.fixedPrice.toFixed(2)} */}
                </span>
              </div>

              {isSelected && (
                <div className={styles.cardSelectedOverlay} aria-hidden="true">
                  <CheckIcon />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <TotalSummary price={computedTotal} />

      <ViewAllCoursesLink />
    </div>
  );
};

// Helper components (no changes needed for logic)
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
        to={{ pathname: "/", state: { scrollTo: "service" } }}
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

// Prop type definitions - updated to reflect the transformed data structure
ProgramSelection.propTypes = {
  programs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,          // Mapped from backend's courseId
      name: PropTypes.string.isRequired,          // Mapped from backend's courseTitle
      shortDescription: PropTypes.string.isRequired, // Mapped from backend's courseDetails
      fixedPrice: PropTypes.number.isRequired,    // Mapped from backend's price
      courses: PropTypes.arrayOf(                 // Mapped to [{id: courseId, name: courseTitle}]
        PropTypes.shape({
          id: PropTypes.string, // Changed to not required in case backend doesn't provide for inner list
          name: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  selectedProgramIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onProgramSelect: PropTypes.func.isRequired,
  totalPrice: PropTypes.number, // calculateTotalPrice prop is removed, totalPrice is passed directly
};

export default ProgramSelection;