import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/frontend_assets/assets';
import CartTotal from '../components/CartTotal';
import { MutatingDots } from 'react-loader-spinner';
import { FaShoppingCart } from 'react-icons/fa';
import OurPolicy from '../components/OurPolicy';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [showAnimation, setShowAnimation] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Tracks items whose requested quantity exceeds availableQty (frontend or server)
  // Array of { name, requested, available }
  const [unavailableItems, setUnavailableItems] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Build cartData from cartItems + products
  useEffect(() => {
    if (products?.length > 0 && cartItems) {
      const tempData = [];

      for (const productId in cartItems) {
        const product = products.find((p) => p._id === productId);
        if (!product) continue;

        for (const variantKey in cartItems[productId]) {
          const quantity = cartItems[productId][variantKey];
          if (quantity <= 0) continue;

          const variant = product.variants.find((v) => v._id === variantKey);
          const size = variant?.size || '';
          const age = variant?.age ? `${variant.age} ${variant.ageUnit}` : '';
          const color = variant?.color || '';
          const availableQty = variant?.quantity || 0;

          // Safely build image URL:
          const rawImgValue = Array.isArray(product.image)
            ? product.image[0] ?? ''
            : product.image ?? '';

          let finalImageURL = '';
          if (rawImgValue) {
            finalImageURL = rawImgValue.startsWith('http')
              ? rawImgValue
              : `${backendUrl ?? ''}${rawImgValue}`;
          }

          tempData.push({
            _id: productId,
            variantKey,
            productName: product.name,
            image: finalImageURL, // either '' or a valid URL
            price: product.discountedPrice || product.price,
            size,
            age,
            color,
            quantity,
            availableQty, // initial front‐end quantity
          });
        }
      }

      setCartData(tempData);
    }
  }, [cartItems, products]);

  // Recompute unavailableItems whenever cartData changes,
  // merging any previous server errors that still apply.
  useEffect(() => {
    // Keep only server errors that still apply:
    const stillInvalidByName = unavailableItems.filter((u) => {
      const match = cartData.find((cd) => cd.productName === u.name);
      return match && match.quantity > match.availableQty;
    });

    // Front‐end invalids (quantity > availableQty in local state)
    const frontendInvalids = cartData
      .filter((item) => item.quantity > item.availableQty)
      .map((item) => ({
        name: item.productName,
        requested: item.quantity,
        available: item.availableQty,
      }));

    // Merge & dedupe by name
    const merged = [
      ...stillInvalidByName,
      ...frontendInvalids.filter((fi) => !stillInvalidByName.some((si) => si.name === fi.name)),
    ];
    setUnavailableItems(merged);
  }, [cartData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle quantity changes (ignore invalid changes)
 const handleChange = (item, newQty) => {
  if (newQty < 1) return;

  // If user is trying to increase past availableQty, show toast and block
  if (newQty > item.availableQty && newQty > item.quantity) {
    toast.error(`"${item.productName}" only has ${item.availableQty} in stock.`);
    return;
  }

  // Otherwise (including reductions), apply the change
  updateQuantity(item._id, item.variantKey, newQty);
};


  // When “Proceed to Checkout” is clicked, verify stock with backend.
  // If server responds with unavailable items, overwrite cartData.availableQty accordingly.
  const handleProceedClick = async () => {
    if (cartData.length === 0) {
      return;
    }

    // Build payload for server
    const payload = cartData.map((item) => ({
      productId: item._id,
      variantId: item.variantKey,
      requestedQty: item.quantity,
    }));

    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/check-availability`,
        { items: payload }
      );

      if (response.data.success) {
        // All good → clear any server errors, open modal
        setUnavailableItems([]);
        setShowModal(true);
      } else {
        // Server says some are unavailable
        const serverUnavailable = response.data.unavailable || [];
        // Map into our { name, requested, available } form:
        const mapped = serverUnavailable.map((it) => ({
          name: it.productName,     // ensure your backend returns productName
          requested: it.requested,
          available: it.available,
        }));

        // 1) Update local cartData.availableQty for each matching itemName:
        const updatedCartData = cartData.map((item) => {
          const serverEntry = mapped.find((u) => u.name === item.productName);
          if (serverEntry) {
            return {
              ...item,
              availableQty: serverEntry.available, // override with server’s available
            };
          }
          return item;
        });
        setCartData(updatedCartData);

        // 2) Overwrite unavailableItems so render shows the warning & disables button
        setUnavailableItems(mapped);
      }
    } catch (err) {
      console.error('Error checking availability:', err);
    }
  };

  const closeModal = () => setShowModal(false);
  const handleFillForm = () => {
    setShowModal(false);
    navigate('/place-order');
  };
  const handleContactSeller = () => {
    const sellerNumber = '1234567890';
    const message = `Hello, I'm interested in placing an order from the cart.`;
    window.open(
      `https://wa.me/${sellerNumber}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <div className="border-t pt-14 max-w-7xl mx-auto px-4 pb-8 relative">
      {showAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <MutatingDots
            height="120"
            width="120"
            color="#32cd32"
            secondaryColor="#2ecc71"
            radius="12.5"
            ariaLabel="mutating-dots-loading"
            visible={true}
          />
        </div>
      )}

      <div className={!showAnimation ? 'opacity-100 transition-opacity duration-700' : 'opacity-0'}>
        <div className="mb-8">
          <Title text1="YOUR" text2="CART" />
        </div>

        <div className="space-y-6">
          {cartData.length > 0 ? (
            cartData.map((item, index) => {
              // Mark as unavailable if either frontend or server flagged it:
              const isUnavailable =
                item.quantity > item.availableQty ||
                unavailableItems.some((u) => u.name === item.productName);

              return (
                <div
                  key={index}
                  className={`flex flex-col sm:flex-row items-center bg-white rounded-lg shadow border border-gray-200 p-4 ${
                    isUnavailable ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-center gap-6 flex-1">
                    {item.image ? (
                      <img
                        src={item.image}
                        className="w-24 sm:w-32 rounded-lg object-cover"
                        alt={item.productName}
                      />
                    ) : null}

                    <div>
                      <p className="text-xl font-semibold text-gray-800">
                        {item.productName}
                        {isUnavailable && (
                          <span className="ml-2 text-red-600 font-semibold">
                            ⚠ Item not available
                          </span>
                        )}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-700">
                        <span className="font-medium text-gray-800">
                          {currency}
                          {item.price}
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

                      {isUnavailable && (
                        <p className="mt-2 text-sm text-red-600">
                          Only {item.availableQty} left in stock.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 sm:mt-0">
                    <div className="hidden sm:block">
                      <input
                        type="number"
                        min={1}
                        className="border border-gray-300 w-20 h-10 text-center text-lg rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
                        value={item.quantity}
                        onChange={(e) => handleChange(item, Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:hidden">
                      <button
                        onClick={() => handleChange(item, item.quantity - 1)}
                        className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-200 transition"
                      >
                        –
                      </button>
                      <span className="text-lg font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleChange(item, item.quantity + 1)}
                        className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-200 transition"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => updateQuantity(item._id, item.variantKey, 0)}>
                      <img
                        src={assets.bin_icon}
                        className="w-6 hover:opacity-75 transition"
                        alt="Remove"
                      />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex items-center justify-center w-32 h-32 rounded-full border-4 border-gray-300 mb-4">
                <FaShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-2xl font-semibold text-gray-800">Your cart is empty</p>
              <p className="text-gray-500 mt-2">Add some products to start shopping!</p>
            </div>
          )}
        </div>

        {cartData.length > 0 && (
          <div className="mt-16">
            <div className="w-full sm:w-[450px] mx-auto">
              <CartTotal />
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={handleProceedClick}
                disabled={unavailableItems.length > 0}
                className={`text-lg px-8 py-3 rounded-full shadow transition duration-300
                  ${
                    unavailableItems.length > 0
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        )}

        <OurPolicy />
      </div>

      {/* Checkout Guidelines Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-11/12 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
            <ol className="list-decimal list-inside text-left space-y-2 mb-6">
              <li>Fill out the order form with your details.</li>
              <li>
                Click <span className="font-semibold">Contact Seller</span> to open WhatsApp.
              </li>
              <li>
                Press <span className="font-semibold">Send</span> in WhatsApp to message the seller.
              </li>
              <li>After confirmation, send payment via GPay to the provided number.</li>
            </ol>
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={handleFillForm}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full"
              >
                Proceed
              </button>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
