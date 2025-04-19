// controllers/orderController.js

import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

// ─── Place Order (COD) ───────────────────────────────────────────────────────
export const placeOrder = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const newOrder = new orderModel({
      userId: "guest",
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
      status: "Order Placed",
    });
    await newOrder.save();
    return res.json({ success: true, message: "Order Placed" });
  } catch (err) {
    console.error("placeOrder:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Place Order via Stripe (stub) ───────────────────────────────────────────
export const placeOrderStripe = async (req, res) => {
  // TODO: implement Stripe payment flow
  return res.json({ success: false, message: "Stripe method not implemented yet." });
};

// ─── Place Order via Razorpay (stub) ─────────────────────────────────────────
export const placeOrderRazorpay = async (req, res) => {
  // TODO: implement Razorpay payment flow
  return res.json({ success: false, message: "Razorpay method not implemented yet." });
};

// ─── Get All Orders (admin) ──────────────────────────────────────────────────
export const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    return res.json({ success: true, orders });
  } catch (err) {
    console.error("allOrders:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get User’s Orders ────────────────────────────────────────────────────────
export const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    return res.json({ success: true, orders });
  } catch (err) {
    console.error("userOrders:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update Order Status & Adjust Inventory ─────────────────────────────────
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // If “Cancelled” → non‑Cancelled: deduct stock
    if (order.status === "Cancelled" && status !== "Cancelled") {
      for (const item of order.items) {
        const p = await productModel.findById(item._id);
        if (!p) continue;
        const i = p.variants.findIndex(v => v._id.toString() === item.variantId);
        if (i === -1) {
          return res.json({ success: false, message: `Variant not found for ${item.productName}` });
        }
        if (p.variants[i].quantity < item.quantity) {
          return res.json({ success: false, message: `Insufficient stock for ${item.productName}` });
        }
        p.variants[i].quantity -= item.quantity;
        await p.save();
      }
    }

    // If non‑Cancelled → “Cancelled”: restore stock
    if (status === "Cancelled" && order.status !== "Cancelled") {
      for (const item of order.items) {
        const p = await productModel.findById(item._id);
        if (!p) continue;
        const i = p.variants.findIndex(v => v._id.toString() === item.variantId);
        if (i !== -1) {
          p.variants[i].quantity += item.quantity;
        } else {
          p.variants.push({
            size: item.size,
            age: item.age,
            ageUnit: item.ageUnit,
            quantity: item.quantity,
            color: item.color || "default",
          });
        }
        await p.save();
      }
    }

    order.status = status;
    await order.save();
    return res.json({ success: true, message: "Order status updated" });
  } catch (err) {
    console.error("updateStatus:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update Payment Status ───────────────────────────────────────────────────
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, payment } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { payment }, { new: true });
    return res.json({ success: true, message: "Payment status updated" });
  } catch (err) {
    console.error("updatePaymentStatus:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete Order & Restore Inventory ────────────────────────────────────────
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Restore each item’s stock
    for (const item of order.items) {
      const p = await productModel.findById(item._id);
      if (!p) continue;
      const i = p.variants.findIndex(v => v._id.toString() === item.variantId);
      if (i !== -1) {
        p.variants[i].quantity += item.quantity;
        await p.save();
      }
    }

    // Remove the order record
    await orderModel.findByIdAndDelete(orderId);
    return res.json({ success: true, message: "Order deleted and inventory restored" });
  } catch (err) {
    console.error("deleteOrder:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
