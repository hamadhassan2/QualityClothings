import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const Sidebar = () => {
  return (
    <div className="w-[18%] h-screen border-r-2 fixed top-0 left-0 bg-white overflow-y-auto">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        <NavLink
          to="/add"
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l mt-20 ${
              isActive ? "bg-[#4b5563] text-white" : ""
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img
                className={`w-5 h-5 ${isActive ? "filter brightness-0 invert" : ""}`}
                src={assets.add_icon}
                alt="Add Items"
              />
              <p className="hidden md:block">Add Items</p>
            </>
          )}
        </NavLink>

        <NavLink
          to="/list"
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-[#4b5563] text-white" : ""
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img
                className={`w-5 h-5 ${isActive ? "filter brightness-0 invert" : ""}`}
                src={assets.order_icon}
                alt="List Items"
              />
              <p className="hidden md:block">List Items</p>
            </>
          )}
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-[#4b5563] text-white" : ""
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img
                className={`w-5 h-5 ${isActive ? "filter brightness-0 invert" : ""}`}
                src={assets.order_icon}
                alt="Orders"
              />
              <p className="hidden md:block">Orders</p>
            </>
          )}
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
