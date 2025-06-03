import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styles from "./ProgramSelection.module.css";

const ProgramSelection = ({
  programs,
  selectedProgramIds,
  onProgramSelect,
  calculateTotalPrice, // Keep for backward compatibility
  totalPrice, // New prop
}) => {
  const computedTotal =
    typeof calculateTotalPrice === "function"
      ? calculateTotalPrice()
      : totalPrice;

  const handleCheckboxClick = (e, programId) => {
    e.stopPropagation();
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
                    className={styles.visuallyHidden}
                  />
                  <span
                    className={styles.checkboxIndicator}
                    aria-hidden="true"
                  />
                </div>

                <label
                  htmlFor={program.id}
                  className={styles.programTitleLabel}
                >
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

// Helper components for better organization
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

// Prop type definitions
ProgramSelection.propTypes = {
  programs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      shortDescription: PropTypes.string.isRequired,
      fixedPrice: PropTypes.number.isRequired,
      courses: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  selectedProgramIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onProgramSelect: PropTypes.func.isRequired,
  calculateTotalPrice: PropTypes.func,
  totalPrice: PropTypes.number,
};

export default ProgramSelection;
