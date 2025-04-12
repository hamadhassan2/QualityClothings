import React from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { assets } from '../assets/frontend_assets/assets';

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div>
      {/* Horizontal line over the footer */}
      <hr className="border-t border-gray-300 mb-10" />
      
      <div className="flex flex-col sm:grid grid-cols-[6fr_2fr_3fr] gap-10 my-10 mt-10 text-sm">
        <div>
          <img src='./updatedlogo.png' className="mb-5 w-32" alt="Company Logo" />
          <p className="w-full md:w-2/3 text-gray-600">
            At QualityClothings Fashion, we blend contemporary style with timeless elegance.
            Our collections are curated to empower you with premium quality, comfort,
            and standout designs that reflect your unique personality.
          </p>
        </div>

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

        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li className="flex items-center">
              <a 
                href="https://wa.me/919963472288" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center hover:underline"
              >
                <FaWhatsapp className="mr-2 text-lg text-green-500" />
                Whatsapp: +91 99634 72288
              </a>
            </li>
            <li>Address: 567 Delhi, India</li>
            <li>
              Email:{" "}
              <a
                href="mailto:qualityclothings.90@gmail.com"
                className="text-blue-500 hover:underline"
              >
                qualityclothings.90@gmail.com
              </a>
            </li>
          </ul>
        </div>
      
      </div>
    </div>
  );
};

export default Footer;
