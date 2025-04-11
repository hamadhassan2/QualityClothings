import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductCard from './ProductCard';

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    if (products && products.length > 0) {
      // Filter for best sellers and show up to 8 products
      const bestProducts = products.filter((item) => item.bestseller);
      setBestSeller(bestProducts.slice(0, 8));
    }
  }, [products]);

  return (
    <div className="my-10">
      <div className="text-center py-8">
        <Title text1="BEST" text2="SELLERS" />
        <p className="w-3/4 mx-auto text-xs sm:text-sm md:text-base text-gray-600 mt-2">
          Explore our top-rated best sellers – the most popular and trusted products by our customers.
        </p>
      </div>

      {/* Responsive grid: 2 columns on small and md, 4 columns on large screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {bestSeller.map((item, index) => {
          // Use the first image if item.image is an array
          const img = Array.isArray(item.image) ? item.image[0] : item.image;
          return (
            <ProductCard
              key={item._id || index}
              id={item._id}
              img={img}
              name={item.name}
              category={item.category}
              subCategory={item.subCategory}
              price={item.price}
              discountedPrice={item.discountedPrice}
              ages={item.ages}
              count={item.count}
              color={item.color}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BestSeller;
