import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

import {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  updatePaymentStatus,
  deleteOrder
} from "../controllers/orderController.js";

import { getSalesAnalytics } from "../controllers/analyticsController.js";

const orderRouter = express.Router();

// ─── Admin Features ─────────────────────────────────────────────────────────
orderRouter.post("/list",                adminAuth, allOrders);
orderRouter.post("/status",              adminAuth, updateStatus);
orderRouter.post("/updatePaymentStatus", adminAuth, updatePaymentStatus);
orderRouter.delete("/delete/:orderId",   adminAuth, deleteOrder);

// ─── Analytics ──────────────────────────────────────────────────────────────
// Body: { startDate?: "YYYY‑MM‑DD", endDate?: "YYYY‑MM‑DD" }
orderRouter.post("/analytics",           adminAuth, getSalesAnalytics);

// ─── Payment Features ───────────────────────────────────────────────────────
orderRouter.post("/place",    authUser, placeOrder);
orderRouter.post("/stripe",   authUser, placeOrderStripe);
orderRouter.post("/razorpay", authUser, placeOrderRazorpay);

// ─── User Feature ───────────────────────────────────────────────────────────
orderRouter.post("/userorders", authUser, userOrders);

export default orderRouter;
