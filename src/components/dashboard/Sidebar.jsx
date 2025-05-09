import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const studentLinks = [
    {
      id: 1,
      name: "Dashboard",
      path: "dashboard", // 👈 Relative path
      icon: "🆔"
    },
    {
      id: 2,
      name: "Enrolled Courses",
      path: "enrolled-courses", // 👈 Relative path
      icon: "📚"
    },
    {
      id: 3,
      name: "Assignments",
      path: "assignments", // 👈 Relative path
      icon: "📝"
    },
    {
      id: 4,
      name: "Attendance",
      path: "attendance", // 👈 Relative path
      icon: "📅"
    },
  ];

  return (
    <div className="flex h-full flex-col gap-y-4 border-r-[1px] border-r-richblack-700 bg-richblack-800 py-10 px-6 min-w-[220px]">
      <h2 className="text-richblack-200 uppercase text-sm font-semibold">Student Navigation</h2>

      <div className="flex flex-col gap-4 mt-4">
        {studentLinks.map((link) => (
          <NavLink
            key={link.id}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium ${
                isActive
                  ? "bg-richblack-700 text-yellow-50"
                  : "text-richblack-200 hover:bg-richblack-700"
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;