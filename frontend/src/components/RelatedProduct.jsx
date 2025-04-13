import React from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({
  id,
  name,
  img,
  category,
  subCategory,
  price,
  discountedPrice,
  ages,
  count,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigate to the product's detail page, e.g., /product/:id
    navigate(`/product/${id}`);
  };

  return (
    <div 
      className="cursor-pointer hover:shadow-lg transition p-4 border rounded-lg"
      onClick={handleCardClick}
    >
      <img src={img} alt={name} className="w-full h-auto object-cover" />
      <h3 className="font-bold text-lg mt-2">{name}</h3>
      {/* Other info such as price, category, etc. */}
      <p className="text-gray-600">
        {discountedPrice ? (
          <>
            <span className="line-through text-sm text-red-500 mr-2">
              {price}
            </span>
            <span>{discountedPrice}</span>
          </>
        ) : (
          <span>{price}</span>
        )}
      </p>
    </div>
  );
};

export default ProductCard;
