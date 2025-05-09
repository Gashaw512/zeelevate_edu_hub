// src/components/common/ProfileOptionItem.jsx

import React from 'react'
import { Link } from 'react-router-dom'

const ProfileOptionItem = ({ option, closeDropdown }) => {
  if (option.path) {
    return (
      <Link
        to={option.path}
        onClick={closeDropdown}
        className="flex items-center gap-3 px-4 py-2 text-richblack-100 hover:bg-richblack-700 text-sm"
      >
        <span>{option.icon}</span>
        {option.name}
      </Link>
    )
  }

  return (
    <button
      onClick={() => {
        option.action()
        closeDropdown()
      }}
      className="w-full text-left flex items-center gap-3 px-4 py-2 text-richblack-100 hover:bg-richblack-700 text-sm"
    >
      <span>{option.icon}</span>
      {option.name}
    </button>
  )
}

export default ProfileOptionItem
