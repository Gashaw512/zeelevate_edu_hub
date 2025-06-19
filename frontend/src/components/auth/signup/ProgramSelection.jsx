// src/components/SignUp/ProgramSelection/ProgramSelection.jsx
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import React from 'react';
import styles from "./ProgramSelection.module.css";

const ProgramSelection = ({
  programs,
  selectedProgramIds,
  onProgramSelect,
  totalPrice,
}) => {
  const isProgramSelectable = (status) => {
    return status === 'available' || status === 'beta';
  };

  const handleCheckboxClick = (e, programId, status) => {
    e.stopPropagation(); // Prevent parent div's onClick from firing
    if (isProgramSelectable(status)) {
      onProgramSelect(programId);
    }
  };

  const handleCardClick = (programId, status) => {
    if (isProgramSelectable(status)) {
      onProgramSelect(programId);
    }
  };

  return (
    <div className={styles.programSelectionSection}>
      <div className={styles.programCardsContainer}>
        {/* Ensure programs is an array before mapping */}
        {Array.isArray(programs) && programs.map((program) => {
          const isSelected = selectedProgramIds.includes(program.programId);
          const selectable = isProgramSelectable(program.status);

          return (
            <div
              key={program.programId}
              className={`${styles.programCard} ${isSelected ? styles.selected : ""} ${
                !selectable ? styles.unselectable : ""
              }`}
              onClick={() => handleCardClick(program.programId, program.status)}
              tabIndex={selectable ? "0" : "-1"}
              role="checkbox"
              aria-checked={isSelected}
              aria-disabled={!selectable}
            >
              {program.badge && (
                <div className={styles.programBadge}>
                  {program.badge}
                </div>
              )}

              <div className={styles.programHeaderSelection}>
                <div className={styles.customCheckbox}>
                  <input
                    type="checkbox"
                    id={`program-checkbox-${program.programId}`}
                    checked={isSelected}
                    onChange={(e) => handleCheckboxClick(e, program.programId, program.status)}
                    className={styles.visuallyHidden}
                    disabled={!selectable}
                  />
                  <span
                    className={styles.checkboxIndicator}
                    aria-hidden="true"
                  />
                </div>

                <label
                  htmlFor={`program-checkbox-${program.programId}`}
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
                    {Array.isArray(program.courses) && program.courses.length > 0 ? (
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
                  {selectable ?
                    // Robustly ensure program.price is a valid number before toFixed
                    `$${(typeof program.price === 'number' && !isNaN(program.price) ? program.price : 0).toFixed(2)}`
                    : 'N/A'
                  }
                </span>
              </div>

              {isSelected && (
                <div className={styles.cardSelectedOverlay} aria-hidden="true">
                  <CheckIcon />
                </div>
              )}

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

      <TotalSummary price={totalPrice} />

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

const TotalSummary = ({ price }) => {
  // Ensure price is a safe number for display, defaulting to 0 if invalid
  const safePrice = typeof price === 'number' && !isNaN(price) ? price : 0;
  return (
    <div className={styles.totalSummaryArea}>
      <p className={styles.totalPriceLabel}>Total Enrollment Cost:</p>
      <p className={styles.totalPriceAmount}>${safePrice.toFixed(2)}</p>
    </div>
  );
};

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
        state={{ scrollTo: "service" }}
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
      programId: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      shortDescription: PropTypes.string,
      price: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      courses: PropTypes.arrayOf(
        PropTypes.shape({
          courseId: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  selectedProgramIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onProgramSelect: PropTypes.func.isRequired,
  totalPrice: PropTypes.number.isRequired,
};

export default ProgramSelection;