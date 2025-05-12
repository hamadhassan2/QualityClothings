// src/components/LatestCollection.jsx
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductCard from "./ProductCard";
import { Link, useNavigate } from "react-router-dom";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (products && products.length > 0) {
      // Display the latest 12 products
      setLatestProducts(products.slice(0, 12));
    }
  }, [products]);

  return (
    <div className="my-10">
      <div className="text-center py-8">
        <Title text1="LATEST" text2="COLLECTION" />
        <p className="w-3/4 mx-auto text-xs sm:text-sm md:text-base text-gray-600 mt-2">
          Discover the trendiest styles of the season with our latest collection.
          Each piece is curated to bring you fresh, fashion-forward designs that
          blend comfort with elegance. Elevate your wardrobe with quality fabrics,
          vibrant colors, and unique details that set you apart.
        </p>
      </div>

      {/* Responsive grid: 2 cards on small/medium screens, 4 on large */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {latestProducts.map((item, index) => {
          // Use first image if item.image is an array
          const img = Array.isArray(item.image) ? item.image[0] : item.image;
          return (
            <ProductCard
              key={item._id || index}
              id={item._id}
              img={img}
              name={item.name}
              subCategory={item.subCategory}
              price={item.price}
              discountedPrice={item.discountedPrice}
              count={item.count}
              // ← pass in the navigation handler
              onClick={() => navigate(`/product/${item._id}`)}
            />
          );
        })}
      </div>

      {/* Explore More Collections Button */}
      <div className="flex justify-center mt-10">
        <Link
          to="/collection"
          className="inline-block px-8 py-3 border-2 border-black text-black font-bold rounded-full transition-all duration-300 hover:bg-gray-900 hover:text-white"
        >
          Explore More Collections
        </Link>
      </div>
    </div>
  );
};

export default LatestCollection;
