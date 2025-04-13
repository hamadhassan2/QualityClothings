import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductCard from "./ProductCard";

const RelatedProduct = ({ category, subCategory }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter(
        (item) => item.category === category && item.subCategory === subCategory
      );
      setRelated(filtered.slice(0, 5));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, category, subCategory]);

  return (
    <div className="my-24">
      <div className="text-center text-3xl py-2">
        <Title text1={"RELATED"} text2={"PRODUCTS"} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {related.map((item) => (
          <ProductCard
            key={item._id}
            id={item._id}
            name={item.name}
            img={Array.isArray(item.image) ? item.image[0] : item.image}
            category={item.category}
            subCategory={item.subCategory}
            price={item.price}
            discountedPrice={item.discountedPrice}
            ages={item.ages}
            count={item.count}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProduct;
