import React, { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { MutatingDots } from "react-loader-spinner";

// Dummy fallback data for fields other than the name.
const dummyData = {
  email: "",
  street: "",
  city: "",
  state: "",
  zipcode: "",
  country: "",
  phone: "",
};

const PlaceOrder = () => {
  const currency = "₹";
  const {
    navigate,
    backendUrl,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const timer = setTimeout(() => setShowAnimation(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const reduceProductQuantity = async (orderItems) => {
    try {
      for (const item of orderItems) {
        const response = await axios.post(backendUrl + "/api/product/reduce-quantity", {
          productId: item._id,
          variantId: item.variantId,
          quantity: item.quantity,
        });

        if (!response.data.success) {
          console.error("Failed to update product quantity:", response.data.message);
          toast.error(`Failed to update product: ${response.data.message}`);
        }
      }
    } catch (error) {
      console.error("Error reducing product quantity:", error);
      toast.error("Error reducing product quantity. Please try again.");
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const finalFormData = { ...formData };

    // If name is empty, generate a random fallback name.
    if (!formData.firstName.trim() && !formData.lastName.trim()) {
      const randomString = Math.random().toString(36).substring(2, 8);
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      const ss = now.getSeconds().toString().padStart(2, "0");
      finalFormData.firstName = `${randomString}_${hh}-${mm}-${ss}`;
      finalFormData.lastName = "";
    }

    // Use dummy fallback data for any empty fields.
    Object.keys(dummyData).forEach((key) => {
      if (!finalFormData[key] || !finalFormData[key].trim()) {
        finalFormData[key] = dummyData[key];
      }
    });

    try {
      let orderItems = [];
      for (const productId in cartItems) {
        for (const variantKey in cartItems[productId]) {
          const quantity = cartItems[productId][variantKey];
          if (quantity > 0) {
            const product = products.find((p) => p._id === productId);
            const variant = product?.variants?.find(
              (v) => v._id.toString() === variantKey
            );
            if (!product || !variant) continue;
            const size = variant.size ? variant.size.toUpperCase() : "";
           // 1️⃣ pull the raw path (first element if array, or the single string)
const raw = Array.isArray(product.image)
? product.image[0]
: product.image || "";

// 2️⃣ build a fully‐qualified, public URL
const productImage = raw.startsWith("http")
? raw
: `${backendUrl}${raw}`;

// 3️⃣ push the item object
orderItems.push({
_id:         productId,
productName: product.name,
subCategory: product.subCategory,
color:       variant.color || "",
size,
age:        variant.age || "",
ageUnit:    variant.ageUnit || "",
quantity,
variantId:   variantKey,
productImage // ← use the URL you just built
});

          }
        }
      }

      if (orderItems.length === 0) {
        toast.error("No order items found. Please add items to your cart.");
        return;
      }

      const cartSubtotal = getCartAmount();
      const totalAmount = cartSubtotal + delivery_fee;
// 1) Total MRP (sum of original price × quantity)
const mrpTotal = orderItems.reduce((sum, item) => {
  const product = products.find(p => p._id === item._id);
  return sum + (product?.price || 0) * item.quantity;
}, 0);

// 2) How much the customer saves
const saveAmount = mrpTotal - cartSubtotal;

      const orderData = {
        userId: "guest",
        address: finalFormData,
        items: orderItems,
        amount: totalAmount,
        paymentMethod: "cod",   // still sent to your backend
      };

      const response = await axios.post(
        backendUrl + "/api/order/place",
        orderData
      );

      if (response.data.success) {
        await reduceProductQuantity(orderItems); // Ensure inventory is updated
        setCartItems({});
        navigate("/orders");
        toast.success(response.data.message);

        // **WhatsApp message: no mention of paymentMethod here**
        const displayName =
          finalFormData.firstName && finalFormData.lastName
            ? `${finalFormData.firstName} ${finalFormData.lastName}`
            : finalFormData.firstName;
        const customerInfo = `Customer: ${displayName}\nEmail: ${finalFormData.email}\nAddress: ${finalFormData.street}, ${finalFormData.city}, ${finalFormData.state}, ${finalFormData.zipcode}, ${finalFormData.country}\nPhone: ${finalFormData.phone}`;
        const itemsMessage = orderItems
          .map((item) => {
            let variantInfo = [];
            if (item.size) variantInfo.push(`Size: ${item.size}`);
            if (item.age) variantInfo.push(`Age: ${item.age} ${item.ageUnit}`);
            if (item.color) variantInfo.push(`Color: ${item.color}`);
            if (item.productImage) {
              const cleanImageUrl = item.productImage.replace(/\)$/, "");
              variantInfo.push(`Image: ${cleanImageUrl}`);
            }
            return `${item.productName} (${item.subCategory}) x ${item.quantity} - ${variantInfo.join(
              ", "
            )}`;
          })
          .join("\n");
          const message =
          `🛍️ *New Order Received!*\n\n${customerInfo}\n\n` +
          `📦 *Order Items:*\n${itemsMessage}\n\n` +
          `💵 MRP: ${currency}${mrpTotal.toFixed(2)}\n` +
          `💸 You Save: ${currency}${saveAmount.toFixed(2)}\n` +
          `💰 Payable: ${currency}${totalAmount.toFixed(2)}`;
        

        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        const whatsappNumber = "+919963472288";
        let encodedMessage = encodeURIComponent(message).replace(/%29$/, "");
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        if (isMobile) {
          window.location.href = whatsappUrl;
        } else {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(message).then(() => {
              toast.info("Order details copied to clipboard!");
            });
          }
          window.open(whatsappUrl, "_blank");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4 relative">
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
      <form
        onSubmit={onSubmitHandler}
        className="bg-white shadow-2xl rounded-lg p-8 w-full max-w-4xl border transition-opacity duration-700"
      >
        <div className="mb-8">
          <Title text1="DELIVERY" text2="INFORMATION" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="border border-gray-300 py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
            type="text"
            placeholder="First Name"
          />
          <input
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="border border-gray-300 py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
            type="text"
            placeholder="Last Name"
          />
          <input
            onChange={onChangeHandler}
            name="email"
            value={formData.email}
            className="border border-gray-300 py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
            type="email"
            placeholder="Email Address"
          />
          <input
            onChange={onChangeHandler}
            name="street"
            value={formData.street}
            className="border border-gray-300 py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
            type="text"
            placeholder="Street Address"
          />
          <input
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="border border-gray-300 py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
            type="text"
            placeholder="City"
          />
          <input
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="border border-gray-300 py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
            type="text"
            placeholder="State"
          />
          <input
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            className="border border-gray-300 py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
            type="number"
            placeholder="Zipcode"
          />
          <input
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className="border border-gray-300 py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
            type="text"
            placeholder="Country"
          />
          <input
            onChange={onChangeHandler}
            name="phone"
            value={formData.phone}
            className="border border-gray-300 py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
            type="number"
            placeholder="Phone Number"
          />
        </div>
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center">
          <div className="w-full md:w-1/2">
            <CartTotal />
          </div>
          <div className="mt-8 md:mt-0">
            <button
              type="submit"
              className="bg-black text-white px-12 py-3 rounded-full text-lg font-medium transition duration-300 hover:bg-gray-800"
            >
              Contact Seller
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;

