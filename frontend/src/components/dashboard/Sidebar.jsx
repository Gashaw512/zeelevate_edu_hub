import React from 'react';
import { NavLink } from 'react-router-dom';
import { sidebarLinksData } from "../../data/sidebarLink"

const Sidebar = () => {

  return (
    <div className="flex h-full flex-col gap-y-4 border-r-[1px]" style={{ borderColor: '#34495E', backgroundColor: '#2C3E50', color: '#fff' , py: '10px', px: '6px', minWidth: '220px' }}>
      <h2 className="uppercase text-sm font-semibold" style={{ color: '#fff' }}>Student Navigation</h2>

      <div className="flex flex-col gap-4 mt-4">
        {sidebarLinksData.map((link) => (
          <NavLink
            key={link.id}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium ${
                isActive
                  ? "text-yellow-50" // Assuming you want to keep the yellow text for active
                  : "hover:bg-34495E" // Using the darker navy for hover
              }`
            }
            style={({ isActive }) => ({ // Receive the isActive state here
              backgroundColor: isActive ? '#00BFFF' : 'transparent', // Use accent color for active background
              color: '#fff' // Ensure text is white
            })}
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