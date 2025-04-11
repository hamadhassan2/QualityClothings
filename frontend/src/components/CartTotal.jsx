import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = () => {
  const { products, cartItems, currency } = useContext(ShopContext);

  let subtotal = 0;
  if (products && cartItems) {
    for (const productId in cartItems) {
      const product = products.find(p => p._id === productId);
      if (!product) continue;
      // Use discountedPrice if available, otherwise use product.price.
      const effectivePrice = product.discountedPrice ? product.discountedPrice : product.price;
      for (const variantKey in cartItems[productId]) {
        const quantity = cartItems[productId][variantKey];
        subtotal += effectivePrice * quantity;
      }
    }
  }
  
  // Total now equals to the subtotal only.
  const total = subtotal;

  return (
    <div className="p-4 bg-gray-50 rounded shadow-md">
      <div className="mb-4">
        <Title text1="CART" text2="TOTALS" />
      </div>
      <div className="flex flex-col gap-3 text-base text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>
            {currency}{subtotal.toFixed(2)}
          </span>
        </div>
        <hr className="border-gray-300" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>
            {currency}{total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
