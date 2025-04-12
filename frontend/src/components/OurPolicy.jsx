import React from "react";
import { assets } from "../assets/frontend_assets/assets";

const OurPolicy = () => {
  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {/* No Exchange Policy */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src={assets.exchange_icon} className="w-8" alt="No Exchange Icon" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Exchange Policy</h3>
          <p className="text-gray-600 text-sm">
            All sales are final. We adhere to strict quality controls to ensure every product meets our high standards so that exchanges are simply not necessary.
          </p>
        </div>

        {/* No Return Policy */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src={assets.quality_icon} className="w-8" alt="No Return Icon" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Return Policy</h3>
          <p className="text-gray-600 text-sm">
            Please note that all purchases are final. We maintain a rigorous quality assurance process so you can shop with confidence and clarity.
          </p>
        </div>

        {/* Best Customer Support */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition-shadow duration-300">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src={assets.support_img} className="w-8" alt="Customer Support Icon" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Best Customer Support</h3>
          <p className="text-gray-600 text-sm">
            Our dedicated support team is available 24/7 to assist you. Whether you have a query or need help with your product, contact us on{" "}
            <a 
              href="https://wa.me/919963472288" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-green-500 hover:underline"
            >
              Whatsapp
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OurPolicy;
