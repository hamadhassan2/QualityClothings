import React, { useState, useContext } from 'react';
import { assets } from '../assets/frontend_assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { FaShoppingCart } from 'react-icons/fa';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const { getCartCount, navigate } = useContext(ShopContext);
  const cartCount = getCartCount();

  // Menu items without contact page
  const menuItems = ['/', '/collection', '/about'];

  return (
    <>
      <nav className="bg-white sticky top-[42px] z-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:pl-2 lg:pr-8 py-2 flex items-center">
          {/* Left Column: Logo */}
          <div className="flex-1">
            <Link to="/collection" onClick={() => setVisible(false)}>
              <img src='/updatedlogo.png' className="w-36" alt="Company Logo" />
            </Link>
          </div>

          {/* Center Column: Desktop Menu */}
          <div className="flex-1 hidden sm:flex justify-center">
            <ul className="flex gap-12 text-sm">
              {menuItems.map((path, idx) => (
                <li key={idx}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-1 transition-all duration-200 hover:text-black ${
                        isActive ? 'text-black' : 'text-gray-700'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <p>{path === '/' ? 'HOME' : path.replace('/', '').toUpperCase()}</p>
                        <hr
                          className={`w-8 h-[2px] transition-all duration-200 ${
                            isActive ? 'bg-black' : 'bg-transparent'
                          }`}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Action Icons */}
          <div className="flex-1 flex justify-end items-center gap-6">
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
      </nav>

      {/* Overlay: close sidebar when clicking outside */}
      {visible && (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          onClick={() => setVisible(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-white/70 backdrop-blur-sm shadow-lg transform transition-transform duration-300 sm:hidden w-64 z-50 ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
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
              {path === '/' ? 'HOME' : path.replace('/', '').toUpperCase()}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;