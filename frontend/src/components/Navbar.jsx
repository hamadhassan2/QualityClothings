import React, { useState, useContext } from 'react';
import { assets } from '../assets/frontend_assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { FaShoppingCart, FaClipboardList } from 'react-icons/fa';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const { getCartCount, navigate } = useContext(ShopContext);

  const cartCount = getCartCount();

  // Menu items without contact page
  const menuItems = ["/", "/collection", "/about"];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src='./updatedlogo.png' className="w-36" alt="Company Logo" />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden sm:flex gap-8 text-sm">
          {menuItems.map((path, idx) => (
            <li key={idx}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 transition-all duration-200 hover:text-black ${
                    isActive ? "text-black" : "text-gray-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <p>{path === "/" ? "ghar" : path.replace("/", "").toUpperCase()}</p>
                    <hr
                      className={`w-8 h-[2px] transition-all duration-200 ${
                        isActive ? "bg-black" : "bg-transparent"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Action Icons */}
        <div className="flex items-center gap-6">
          {/* Orders Icon (replacing profile) */}
          <Link to="/orders">
            <FaClipboardList className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="relative">
            <FaShoppingCart className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -bottom-2 w-5 h-5 flex items-center justify-center bg-red-600 text-white text-xs font-bold rounded-full border-2 border-white shadow-md">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Icon */}
          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            className="w-5 cursor-pointer hover:scale-110 transition-transform sm:hidden"
            alt="Menu"
          />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-lg transform transition-transform duration-300 ${
          visible ? 'translate-x-0' : 'translate-x-full'
        } sm:hidden w-64 z-50`}
      >
        <div className="p-4 flex justify-end">
          <img
            onClick={() => setVisible(false)}
            src={assets.dropdown_icon}
            className="h-6 cursor-pointer transform rotate-180"
            alt="Close"
          />
        </div>
        <div className="flex flex-col text-gray-700">
          {menuItems.map((path, idx) => (
            <NavLink
              key={idx}
              to={path}
              onClick={() => setVisible(false)}
              className="py-3 px-6 border-b transition-colors hover:bg-gray-100"
            >
              {path === "/" ? "HOME" : path.replace("/", "").toUpperCase()}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
