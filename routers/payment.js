const express = require("express");
const router = express.Router();

const {
  createProductOrder,
  createBookingOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const { razorpayWebhook } = require("../controllers/webhookController");

const { authMiddleware } = require("../middleware/authMiddleware");

// 🛒 Orders
router.post("/product-order", authMiddleware, createProductOrder);
router.post("/booking-order", authMiddleware, createBookingOrder);

// ⚠️ Optional (UI sync only, NOT business logic)
router.post("/verify-payment", verifyPayment);

// 🔥 Webhook (REAL SOURCE OF TRUTH)
router.post("/webhook", express.json({ type: "*/*" }), razorpayWebhook);

module.exports = router;