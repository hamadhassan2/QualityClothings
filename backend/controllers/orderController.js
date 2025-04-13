import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // If the order was previously cancelled and now is changed to a non-cancelled status,
    // reduce inventory accordingly.
    if (order.status === "Cancelled" && status !== "Cancelled") {
      for (const item of order.items) {
        const product = await productModel.findById(item._id);
        if (!product) continue;
        const variantIndex = product.variants.findIndex(
          (v) => v._id.toString() === item.variantId
        );
        if (variantIndex === -1) {
          return res.json({
            success: false,
            message: `Variant not found for product ${item.productName}`,
          });
        }
        if (product.variants[variantIndex].quantity < item.quantity) {
          return res.json({
            success: false,
            message: `Insufficient stock for product ${item.productName}`,
          });
        }
        product.variants[variantIndex].quantity -= item.quantity;
        await product.save();
      }
    }

    // If changing status to "Cancelled" (from a non-cancelled state), restore inventory.
    if (status === "Cancelled" && order.status !== "Cancelled") {
      for (const item of order.items) {
        const product = await productModel.findById(item._id);
        if (!product) continue;
        const variantIndex = product.variants.findIndex(
          (v) => v._id.toString() === item.variantId
        );
        if (variantIndex !== -1) {
          product.variants[variantIndex].quantity += item.quantity;
        } else {
          product.variants.push({
            size: item.size,
            age: item.age,
            ageUnit: item.ageUnit,
            quantity: item.quantity,
            color: item.color || "default",
          });
        }
        await product.save();
      }
    }

    // Update the order status irrespective of any inventory adjustments.
    order.status = status;
    await order.save();
    return res.json({ success: true, message: "Order Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, payment } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { payment }, { new: true });
    res.json({
      success: true,
      message: "Payment status updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const placeOrder = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const orderData = {
      userId: "guest",
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
      status: "Order Placed",
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const placeOrderStripe = async (req, res) => {
  res.json({ success: false, message: "Stripe method not implemented yet." });
};

const placeOrderRazorpay = async (req, res) => {
  res.json({ success: false, message: "Razorpay method not implemented yet." });
};

const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// New delete order functionality
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await orderModel.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  updatePaymentStatus,
  deleteOrder,
};
