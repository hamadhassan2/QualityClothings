import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  // Initialize cartItems from localStorage if available.
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cartItems");
    return storedCart ? JSON.parse(storedCart) : {};
  });
  
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // Save cartItems to localStorage whenever it changes.
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Enhanced addToCart: Check variant-specific stock before adding.
  const addToCart = async (itemId, variantOrObj) => {
    const productData = products.find((product) => product._id === itemId);
    if (!productData) {
      toast.error("Product not found.");
      return;
    }

    let variantId;
    let variantQuantity = 0;
    if (typeof variantOrObj === "object" && variantOrObj !== null) {
      variantId = variantOrObj._id.toString();
      variantQuantity = Number(variantOrObj.quantity) || 0;
    } else {
      variantId = variantOrObj;
      const variant = productData.variants.find(
        (v) => v._id.toString() === variantOrObj
      );
      variantQuantity = variant ? Number(variant.quantity) : 0;
    }

    let cartData = structuredClone(cartItems);
    const currentQty =
      cartData[itemId] && cartData[itemId][variantId]
        ? cartData[itemId][variantId]
        : 0;

    if (currentQty + 1 > variantQuantity) {
      toast.error(
        `Cannot add more than available stock. Only ${variantQuantity} available.`
      );
      return;
    }
    if (cartData[itemId]) {
      if (cartData[itemId][variantId]) {
        cartData[itemId][variantId] += 1;
      } else {
        cartData[itemId][variantId] = 1;
      }
    } else {
      cartData[itemId] = { [variantId]: 1 };
    }

    toast.info(
      `Product added. ${variantQuantity - (currentQty + 1)} item(s) remaining in stock.`
    );
    setCartItems(cartData);
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const productId in cartItems) {
      for (const variantId in cartItems[productId]) {
        if (cartItems[productId][variantId] > 0) {
          totalCount += cartItems[productId][variantId];
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, variantId, quantity) => {
    let cartData = structuredClone(cartItems);
    // Update the quantity for the given product and variant.
    // Remove the variant if quantity is zero.
    if (quantity === 0) {
      if (cartData[itemId]) {
        delete cartData[itemId][variantId];
        // If there are no variants left for this product, remove the product entry.
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    } else {
      if (!cartData[itemId]) {
        cartData[itemId] = { [variantId]: quantity };
      } else {
        cartData[itemId][variantId] = quantity;
      }
    }
    setCartItems(cartData);
    // Removed backend update since no user login exists.
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const productId in cartItems) {
      const product = products.find((product) => product._id === productId);
      const price = product
        ? Number(product.discountedPrice || product.price)
        : 0;
      for (const variantId in cartItems[productId]) {
        const quantity = cartItems[productId][variantId];
        if (quantity > 0) {
          totalAmount += price * quantity;
        }
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  const value = {
    products,
    setCartItems,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    addToCart,
    cartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
