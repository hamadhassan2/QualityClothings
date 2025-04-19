import React from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/frontend_assets/assets';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row bg-white shadow-md rounded-lg mt-4 overflow-hidden">
      {/* Hero Left Side */}
      <div className="w-full sm:w-1/2 flex flex-col justify-center p-8">
        <div className="mb-4">
          <p className="text-xs font-medium tracking-wide text-gray-600">OUR BESTSELLERS</p>
          <div className="w-16 h-[2px] bg-gray-600 mt-1" />
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Latest Arrivals
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/collection')}
            className="font-semibold text-base text-gray-900 hover:underline cursor-pointer focus:outline-none"
          >
            SHOP NOW
          </button>
          <div className="w-16 h-[1px] bg-gray-600" />
        </div>
      </div>

      {/* Hero Right Side */}
      <div className="w-full sm:w-1/2">
        <img
          src='./Herosection.jpg'
          alt="Hero"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Hero;
