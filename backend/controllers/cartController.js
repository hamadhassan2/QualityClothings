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
};

export { addToCart, updateCart, getUserCart };
