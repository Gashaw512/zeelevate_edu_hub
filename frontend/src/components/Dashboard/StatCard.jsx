// --- src/components/dashboard/StatCard.jsx ---
// Reusable component for displaying statistics.
import PropTypes from 'prop-types';
import React from 'react'; // Ensure React is imported

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h4 className="text-3xl font-bold text-gray-900">{value}</h4>
    </div>
    <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
      <Icon size={28} />
    </div>
  </div>
);

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.elementType.isRequired, // Icon should be a React component (e.g., from lucide-react)
};

export default StatCard;