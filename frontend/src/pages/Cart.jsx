import React, { useEffect, useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/frontend_assets/assets';
import CartTotal from '../components/CartTotal';
import { toast } from 'react-toastify';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products?.length > 0 && cartItems) {
      const tempData = [];

      for (const productId in cartItems) {
        const product = products.find(p => p._id === productId);
        if (!product) continue;

        for (const variantKey in cartItems[productId]) {
          const quantity = cartItems[productId][variantKey];
          if (quantity > 0) {
            const variant = product.variants.find(v => v._id === variantKey);
            const size = variant?.size || '';
            const age = variant?.age ? `${variant.age} ${variant.ageUnit}` : '';
            const color = variant?.color || '';
            const availableQty = variant?.quantity || 0;

            tempData.push({
              _id: productId,
              variantKey,
              productName: product.name,
              image: Array.isArray(product.image) ? product.image[0] : product.image,
              price: product.discountedPrice || product.price,
              size,
              age,
              color,
              quantity,
              availableQty
            });
          }
        }
      }

      setCartData(tempData);
    }
  }, [cartItems, products]);

  const handleCheckout = () => {
    if (cartData.length > 0) {
      navigate('/place-order');
    } else {
      toast.info('Your cart is empty. Please add items before proceeding to checkout.');
    }
  };

  const handleChange = (item, newQty) => {
    if (newQty < 1) return;
    if (newQty > item.availableQty) {
      toast.error(`Only ${item.availableQty} in stock.`);
      return;
    }
    updateQuantity(item._id, item.variantKey, newQty);
  };

  return (
    <div className="border-t pt-14 max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <Title text1="YOUR" text2="CART" />
      </div>

      <div className="space-y-6">
        {cartData.length > 0 ? (
          cartData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center bg-white rounded-lg shadow border border-gray-200 p-4"
            >
              <div className="flex items-center gap-6 flex-1">
                <img
                  src={item.image}
                  className="w-24 sm:w-32 rounded-lg object-cover"
                  alt={item.productName}
                />
                <div>
                  <p className="text-xl font-semibold text-gray-800">{item.productName}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-700">
                    <span className="font-medium text-gray-800">
                      {currency}{item.price}
                    </span>

                    {item.size && (
                      <span className="px-2 py-0.5 border rounded bg-gray-100 text-xs text-gray-700">
                        Size: {item.size}
                      </span>
                    )}
                    {item.age && (
                      <span className="px-2 py-0.5 border rounded bg-gray-100 text-xs text-gray-700">
                        Age: {item.age}
                      </span>
                    )}
                    {item.color && (
                      <div
                        className="w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.color }}
                        title={item.color}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Controls + Remove */}
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 sm:mt-0">
                {/* Desktop quantity input */}
                <div className="hidden sm:block">
                  <input
                    type="number"
                    min={1}
                    className="border border-gray-300 w-20 h-10 text-center text-lg rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                    value={item.quantity}
                    onChange={(e) => handleChange(item, Number(e.target.value))}
                  />
                </div>

                {/* Mobile quantity buttons */}
                <div className="flex items-center gap-2 sm:hidden">
                  <button
                    onClick={() => handleChange(item, item.quantity - 1)}
                    className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-200 transition"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleChange(item, item.quantity + 1)}
                    className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-200 transition"
                  >
                    +
                  </button>
                </div>

                {/* Delete button */}
                <button onClick={() => updateQuantity(item._id, item.variantKey, 0)}>
                  <img
                    src={assets.bin_icon}
                    className="w-6 hover:opacity-75 transition"
                    alt="Remove"
                  />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-xl">Your cart is empty.</p>
        )}
      </div>

      {/* Checkout Summary */}
      <div className="mt-16">
        <div className="w-full sm:w-[450px] mx-auto">
          {cartData.length > 0 && <CartTotal />}
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={handleCheckout}
            className="bg-gray-800 text-white text-lg px-8 py-3 rounded-full transition duration-300 hover:bg-gray-700 shadow"
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
