// Reusable component for displaying key statistics.
import PropTypes from 'prop-types';
import styles from './StatCard.module.css';

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <section
      className={styles.card}
      role="region"
      aria-label={`${title} statistic`}
    >
      <div>
        <p className={styles.title}>{title}</p>
        <h4 className={styles.value}>{value}</h4>
      </div>
      <div className={styles.iconWrapper} aria-hidden="true">
        <Icon size={28} />
      </div>
    </section>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.elementType.isRequired,
};

export default StatCard;
