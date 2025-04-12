import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdAdd, MdList, MdShoppingCart } from 'react-icons/md'; // Material Design icons

const Sidebar = () => {
  return (
    <div className="w-[18%] h-screen border-r-2 fixed top-0 left-0 bg-white overflow-y-auto shadow-md">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        <NavLink
          to="/add"
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l mt-20 transition-all duration-200 ${
              isActive ? "bg-[#4b5563] text-white" : "hover:bg-gray-100"
            }`
          }
        >
          <MdAdd className="w-5 h-5" />
          <p className="hidden md:block">Add Items</p>
        </NavLink>

        <NavLink
          to="/list"
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l transition-all duration-200 ${
              isActive ? "bg-[#4b5563] text-white" : "hover:bg-gray-100"
            }`
          }
        >
          <MdList className="w-5 h-5" />
          <p className="hidden md:block">List Items</p>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l transition-all duration-200 ${
              isActive ? "bg-[#4b5563] text-white" : "hover:bg-gray-100"
            }`
          }
        >
          <MdShoppingCart className="w-5 h-5" />
          <p className="hidden md:block">Orders</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
