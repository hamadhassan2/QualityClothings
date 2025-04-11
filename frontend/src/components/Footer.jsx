import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/frontend_assets/assets';

const Footer = () => {
  // Function to scroll to top
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
      
      {/* Logo & Description */}
      <div>
        <img src='./updatedlogo.png' className="mb-5 w-32" alt="Company Logo" />
        <p className="w-full md:w-2/3 text-gray-600">
          At QualityClothings Fashion, we blend contemporary style with timeless elegance.
          Our collections are curated to empower you with premium quality, comfort,
          and standout designs that reflect your unique personality.
        </p>
      </div>

      {/* Company Links */}
      <div>
        <p className="text-xl font-medium mb-5">COMPANY</p>
        <ul className="flex flex-col gap-1 text-gray-600">
          <li>
            <Link 
              to="/" 
              onClick={scrollToTop}
              className="hover:text-black hover:underline"
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              onClick={scrollToTop}
              className="hover:text-black hover:underline"
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              to="/collection" 
              onClick={scrollToTop}
              className="hover:text-black hover:underline"
            >
              Collection
            </Link>
          </li>
         
        </ul>
      </div>

      {/* Contact Information */}
      <div>
        <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
        <ul className="flex flex-col gap-1 text-gray-600">
          <li>Phone: +91 98765 98765</li>
          <li>Address: 567 Delhi, India</li>
          <li>
            Email:{" "}
            <a
              href="mailto:support@QualityClothingsfashion.com"
              className="text-blue-500 hover:underline"
            >
              support@QualityClothingsfashion.com
            </a>
          </li>
        </ul>
      </div>

    
    </div>
  );
};

export default Footer;
