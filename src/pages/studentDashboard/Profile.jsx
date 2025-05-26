// --- src/pages/Profile.jsx ---
// User profile page.
import React from 'react'; // Ensure React is imported
import { useAuth } from '../../context/AuthContext'; // Use YOUR useAuth

const Profile = () => {
  const { user } = useAuth(); // Get 'user' from AuthContext

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full text-gray-600">
        Loading profile data...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-6">
          <img
            src={user.photoURL || user.avatar || 'https://placehold.co/150x150/cccccc/333333?text=User'}
            alt="Profile Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 mb-4"
          />
          <h3 className="text-2xl font-semibold text-gray-900">{user.displayName || user.name || 'User'}</h3>
          <p className="text-gray-600">{user.email}</p>
          <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full mt-2">
            {user.role}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Full Name</p>
              <p className="text-gray-800 font-medium">{user.displayName || user.name || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Email Address</p>
              <p className="text-gray-800 font-medium">{user.email}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Role</p>
              <p className="text-gray-800 font-medium">{user.role}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-500 text-sm">Member Since</p>
              <p className="text-gray-800 font-medium">Jan 2023 (Mock)</p> {/* Replace with real data */}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;