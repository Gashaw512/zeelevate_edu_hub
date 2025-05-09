import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()

  const profileOptions = [
    {
      name: "My Profile",
      path: "/dashboard/my-profile",
      icon: "👤"
    },
    {
      name: "Sign Out",
      action: logout,
      icon: "🚪"
    }
  ]

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-richblack-700 p-2 rounded-full transition-colors"
      >
        <img 
          src="/default-profile.png" 
          alt="Profile" 
          className="w-8 h-8 rounded-full object-cover"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-richblack-800 border border-richblack-700 rounded-lg shadow-lg py-2 z-50">
          {profileOptions.map((option) => (
            option.path ? (
              <Link
                key={option.name}
                to={option.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-richblack-100 hover:bg-richblack-700 text-sm"
              >
                <span>{option.icon}</span>
                {option.name}
              </Link>
            ) : (
              <button
                key={option.name}
                onClick={() => {
                  option.action()
                  setIsOpen(false)
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-richblack-100 hover:bg-richblack-700 text-sm"
              >
                <span>{option.icon}</span>
                {option.name}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown