import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// Add product to user cart using variantId
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, variantId } = req.body;
    const userData = await userModel.findById(userId);
    let cartData = userData.cartData || {};

    const product = await productModel.findById(itemId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }
    const variant = product.variants.find((v) => v._id.toString() === variantId);
    if (!variant) {
      return res.json({ success: false, message: "Variant not found" });
    }

    const currentQty = cartData[itemId]?.[variantId] || 0;

    if (currentQty >= variant.quantity) {
      return res.json({ success: false, message: "No more quantity available" });
    }

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }
    cartData[itemId][variantId] = currentQty + 1;

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update product quantity in user cart using variantId
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, variantId, quantity } = req.body;
    const userData = await userModel.findById(userId);
    let cartData = userData.cartData || {};

    const product = await productModel.findById(itemId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }
    const variant = product.variants.find((v) => v._id.toString() === variantId);
    if (!variant) {
      return res.json({ success: false, message: "Variant not found" });
    }

    if (quantity > variant.quantity) {
      return res.json({ success: false, message: "Requested quantity exceeds available stock" });
    }

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }
    cartData[itemId][variantId] = quantity;

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId);
    const cartData = userData.cartData || {};
    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};const checkAvailability = async (req, res) => {
  try {
    // Expect body: { items: [ { productId, variantId, requestedQty }, ... ] }
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    const unavailable = [];

    for (const { productId, variantId, requestedQty } of items) {
      const product = await productModel.findById(productId);
      if (!product) {
        // If product not found, treat as unavailable with zero stock
        unavailable.push({
          productId,               // <— include productId
          variantId,               // <— include variantId
          productName: "Unknown Product",
          requested: requestedQty,
          available: 0,
        });
        continue;
      }

      const variant = product.variants.find((v) => v._id.toString() === variantId);
      const availableQty = variant?.quantity ?? 0;

      if (!variant || availableQty < requestedQty) {
        unavailable.push({
          productId,               // <— include productId
          variantId,               // <— include variantId
          productName: product.name,
          requested: requestedQty,
          available: availableQty,
        });
      }
    }

    if (unavailable.length > 0) {
      return res.json({ success: false, unavailable });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("checkAvailability error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export { addToCart, updateCart, getUserCart, checkAvailability };
