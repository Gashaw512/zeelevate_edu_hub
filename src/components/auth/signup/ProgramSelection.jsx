import React from 'react';
import PropTypes from 'prop-types'; // Recommended for type checking props

const ProgramSelection = ({
  programs,
  selectedProgramIds,
  onProgramSelect,
  calculateTotalPrice,
}) => {
  return (
    <div className="course-selection-section">
      <h3>1. Choose Your Program Modules</h3>

      {programs.map(program => (
        <div
          key={program.id}
          className={`program-card ${selectedProgramIds.includes(program.id) ? 'selected' : ''}`}
          onClick={() => onProgramSelect(program.id)}
        >
          <div className="program-header-selection">
            <input
              type="checkbox"
              id={program.id}
              checked={selectedProgramIds.includes(program.id)}
              onChange={() => onProgramSelect(program.id)}
              onClick={(e) => e.stopPropagation()} // Prevent parent div's onClick from firing twice
            />
            <label htmlFor={program.id} className="program-title-label">
              <h4>{program.name}</h4>
            </label>
          </div>
          <p className="program-short-description">{program.shortDescription}</p>

          <div className="program-card-footer">
            <span className="program-price-label">Price: ${program.fixedPrice.toFixed(2)}</span>
          </div>
        </div>
      ))}
      <p className="total-price">Total Enrollment Cost: ${calculateTotalPrice().toFixed(2)}</p>

      <div className="view-all-courses-container">
        <p>Curious about what each program includes?</p>
        <a href="/courses" className="view-all-courses-link">
          View All Courses & Details
        </a>
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
      courses: PropTypes.array.isRequired,
    })
  ).isRequired,
  selectedProgramIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onProgramSelect: PropTypes.func.isRequired,
  calculateTotalPrice: PropTypes.func.isRequired,
};

export default ProgramSelection;