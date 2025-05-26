// src/components/dashboard/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const navLinks = [
    { name: "Dashboard", path: "/student/dashboard" },
    { name: "Courses", path: "/student/dashboard/courses" },
    { name: "Progress", path: "/student/dashboard/progress" },
    { name: "Assignments", path: "/student/dashboard/assignments" },
    { name: "Profile", path: "/student/dashboard/profile" },
    { name: "Settings", path: "/student/dashboard/settings" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md p-4 flex flex-col h-full">
      <h2 className="text-xl font-bold text-blue-700 mb-8">Zeelevate Academy</h2>

      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <img
            src="https://placehold.co/40x40 "
            alt="User Avatar"
            className="rounded-full w-10 h-10 object-cover"
          />
          <div>
            <p className="font-semibold">Jane Doe</p>
            <p className="text-xs text-gray-500">Student</p>
          </div>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  isActive
                    ? "block py-2 px-4 rounded bg-blue-100 text-blue-800 font-medium"
                    : "block py-2 px-4 rounded hover:bg-gray-200 transition"
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="mt-auto text-sm text-gray-500 pt-4 border-t border-gray-200">
        &copy; {new Date().getFullYear()} Zeelevate Academy
      </footer>
    </aside>
  );
};

export default Sidebar;