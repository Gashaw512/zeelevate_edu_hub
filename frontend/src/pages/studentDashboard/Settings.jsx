// --- src/pages/Settings.jsx ---
// Settings page for user preferences.
import React, { useState } from 'react'; // Ensure React is imported

const SettingsPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings</h2>
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Notification Preferences</h3>
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="emailNotifications" className="text-gray-700">Email Notifications</label>
          <input
            type="checkbox"
            id="emailNotifications"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
            className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Display Preferences</h3>
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="darkMode" className="text-gray-700">Dark Mode</label>
          <input
            type="checkbox"
            id="darkMode"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;