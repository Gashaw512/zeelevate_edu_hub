import PropTypes from 'prop-types';
import './CourseCard.css';
import EnrollButton from '../EnrollButtons/EnrollButton'; // Adjust path as needed

const CourseCard = ({ course, enrollLabel }) => {
  return (
    <article className="course-card">
      <div className="course-card__icon">{course.icon}</div>
      <div className="course-card__content">
        {course.title && <h3 className="course-card__title">{course.title}</h3>}
        {course.description && <p className="course-card__description">{course.description}</p>}

        <div className="course-card__details">
          <div className="course-card__learning">
            {course.learningOutcomes && <h4>What You'll Learn</h4>}
            <ul>
              {course.learningOutcomes && course.learningOutcomes.map((outcome, index) => (
                <li key={index}>
                  <span className="checkmark">✓</span> {outcome}
                </li>
              ))}
            </ul>
          </div>

          <div className="course-card__meta">
            <div className="course-card__requirements">
              {course.duration && <p><strong>Duration:</strong> {course.duration}</p>}
              {course.prerequisites && <p><strong>Prerequisites:</strong> {course.prerequisites}</p>}
            </div>

            <div className="course-card__pricing">
              <div className="course-card__price">
                {course.price && <span className="course-card__amount">${course.price}</span>}
                <span className="course-card__duration">one-time</span>
              </div>
              <EnrollButton
                course={course}
                label={enrollLabel}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.number.isRequired,
    icon: PropTypes.node,
    title: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    duration: PropTypes.string,
    prerequisites: PropTypes.string,
    learningOutcomes: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  enrollLabel: PropTypes.string,
};

export default CourseCard;