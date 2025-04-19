import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = () => {
  const { products, cartItems, currency } = useContext(ShopContext);

  let mrp = 0;
  let discountedTotal = 0;

  if (products && cartItems) {
    for (const productId in cartItems) {
      const product = products.find(p => p._id === productId);
      if (!product) continue;
      const qtys = cartItems[productId];
      for (const variantKey in qtys) {
        const quantity = qtys[variantKey];
        mrp += product.price * quantity;
        discountedTotal += (product.discountedPrice ?? product.price) * quantity;
      }
    }
  }

  const discountAmount = mrp - discountedTotal;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6 text-center">
        <Title text1="CART" text2="TOTALS" />
      </div>

      <div className="space-y-4">
        {/* MRP */}
        <div className="flex justify-between text-gray-500 font-bold">
          <span>MRP</span>
          <span className="line-through">
            {currency}{mrp.toFixed(2)}
          </span>
        </div>

        {/* Discount */}
        <div className="flex justify-between text-red-600 font-bold">
          <span>You Save</span>
          <span>-{currency}{discountAmount.toFixed(2)}</span>
        </div>

        <hr className="border-gray-200" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-800">Total</span>
          <span className="text-xl font-extrabold text-green-600">
            {currency}{discountedTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
