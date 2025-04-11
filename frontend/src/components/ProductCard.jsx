import React from "react";
import { Link } from "react-router-dom";

const currency = "₹ ";

const ProductCard = ({
  id,
  img,
  name,
  category,
  subCategory,
  price,
  discountedPrice,
  ages, // represents available size or age options.
  count
}) => {
  const discountPercent =
    discountedPrice && price ? Math.round(((price - discountedPrice) / price) * 100) : 0;

  return (
    <Link to={`/product/${id}`} className="block">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
        {/* Responsive image container */}
        <div className="relative w-full bg-gray-50 overflow-hidden h-48 sm:h-64 md:h-80 lg:h-80 xl:h-96">
          <img
            src={img}
            alt={name}
            className="w-full h-full object-cover object-center transition-transform duration-300"
          />
          {discountPercent > 0 && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded">
              {discountPercent}% OFF
            </div>
          )}
        </div>
        <div className="p-4 text-left">
          <h2 className="text-lg font-bold text-gray-800">{name}</h2>
          {subCategory && (
            <p className="mt-1 text-sm font-semibold text-gray-700">{subCategory}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            {discountedPrice ? (
              <>
                <p className="text-base font-semibold text-gray-800 line-through">
                  {currency}{price}
                </p>
                <p className="text-base font-bold text-red-500">
                  {currency}{discountedPrice}
                </p>
              </>
            ) : (
              <p className="text-base font-semibold text-gray-800">
                {currency}{price}
              </p>
            )}
          </div>

          {/* Stock and size/age details */}
          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span
              className={`text-xs font-medium ${
                Number(count) > 0 ? "text-green-600" : "text-red-600"
              } border border-current px-2 py-0.5 rounded`}
            >
              {Number(count) > 0 ? "In Stock" : "Out of Stock"}
            </span>
            {/* {ages && Array.isArray(ages) && ages.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {ages.map((option, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-800 rounded-full px-3 py-0.5 text-xs shadow-sm"
                  >
                    {option}
                  </span>
                ))}
              </div>
            )} */}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
