// src/components/SignUp/ProgramSelection/ProgramSelection.jsx
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styles from "./ProgramSelection.module.css";

const ProgramSelection = ({
  programs, // Now expects programs to have a 'courses' array on each object
  selectedProgramIds,
  onProgramSelect,
  totalPrice,
}) => {
  const computedTotal = totalPrice; 

  const handleCheckboxClick = (e, programId) => {
    e.stopPropagation(); 
    onProgramSelect(programId);
  };

  return (
    <div className={styles.programSelectionSection}>
      <div className={styles.programCardsContainer}>
        {programs.map((program) => { 
          // Use program.programId for comparison
          const isSelected = selectedProgramIds.includes(program.programId);

          return (
            <div
              // Use program.programId for the key
              key={program.programId}
              className={`${styles.programCard} ${
                isSelected ? styles.selected : ""
              }`}
              // Pass program.programId to handler
              onClick={() => onProgramSelect(program.programId)}
              tabIndex="0"
              role="checkbox"
              aria-checked={isSelected}
            >
              <div className={styles.programHeaderSelection}>
                <div className={styles.customCheckbox}>
                  <input
                    type="checkbox"
                    // Use program.programId for id and htmlFor
                    id={program.programId}
                    checked={isSelected}
                    onChange={(e) => handleCheckboxClick(e, program.programId)}
                    className={styles.visuallyHidden}
                  />
                  <span
                    className={styles.checkboxIndicator}
                    aria-hidden="true"
                  />
                </div>

                <label
                  htmlFor={program.programId} // Use program.programId for htmlFor
                  className={styles.programTitleLabel}
                >
                  {/* Use program.title from your data */}
                  <h4 className={styles.programName}>{program.title}</h4> 
                </label>
              </div>

              <p className={styles.programShortDescription}>
                {/* Ensure program.shortDescription exists or fallback */}
                {program.shortDescription || 'No description available.'} 
              </p>

              <div className={styles.programDetailsSummary}>
                <div className={styles.programCoursesIncluded}>
                  <h5>What's Included:</h5>
                  <ul>
                    {/* Now program.courses should be correctly populated by SignUp.jsx */}
                    {program.courses && program.courses.length > 0 ? (
                      program.courses.map((course) => (
                        // Use course.courseId for key from your data
                        <li key={course.courseId}> 
                          {course.name}
                        </li> 
                      ))
                    ) : (
                      <li>No specific courses listed.</li> // Fallback if no courses
                    )}
                  </ul>
                </div>
              </div>

              <div className={styles.programCardFooter}>
                <span className={styles.programPriceLabel}>Program Price:</span>
                <span className={styles.programPriceAmount}>
                   {/* Use program.price from your data */}
                   ${program.price?.toFixed(2) || '0.00'} 
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

ProgramSelection.propTypes = {
  programs: PropTypes.arrayOf(
    PropTypes.shape({
      programId: PropTypes.string.isRequired, // Changed from 'id' to 'programId'
      title: PropTypes.string.isRequired,     // Changed from 'name' to 'title'
      shortDescription: PropTypes.string,     // Made optional, as per data observation
      price: PropTypes.number.isRequired,     // Changed from 'fixedPrice' to 'price'
      courses: PropTypes.arrayOf(             // Expects a 'courses' array now
        PropTypes.shape({
          courseId: PropTypes.string.isRequired, // Changed from 'id' to 'courseId'
          name: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  selectedProgramIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onProgramSelect: PropTypes.func.isRequired,
  totalPrice: PropTypes.number,
};

export default ProgramSelection;