// routers/order.js

const express = require("express");
const router = express.Router();

const {
  getUserOrders,
  getOrderById,
  getAllOrders,
  getOrderStats,
  updateOrderStatus,
  updateDelivery,
  cancelOrder,
  resendEmail,
  downloadInvoice,
} = require("../controllers/orderController");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

// ─── Admin Routes (must be before /:id) ─────────────────────
router.get("/all", authMiddleware, adminMiddleware, getAllOrders);

// ─── Customer Routes ────────────────────────────────────────
router.get("/my-orders", authMiddleware, getUserOrders);
router.get("/:id", authMiddleware, getOrderById);
router.post("/:id/cancel", authMiddleware, cancelOrder);
router.get("/stats/dashboard", authMiddleware, adminMiddleware, getOrderStats);
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
router.put("/:id/delivery", authMiddleware, adminMiddleware, updateDelivery);
router.post("/:id/resend-email", authMiddleware, adminMiddleware, resendEmail);
router.get("/:id/invoice", authMiddleware, downloadInvoice);

module.exports = router;
