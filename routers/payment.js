const express = require("express");
const router = express.Router();

const {
  createProductOrder,
  createBookingOrder,
  verifyPayment,
  markPaymentFailed,
  refundPayment,
} = require("../controllers/paymentController");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// 🛒 Orders
router.post(
  "/product-order",
  authMiddleware,
  createProductOrder
);

router.post(
  "/booking-order",
  authMiddleware,
  createBookingOrder
);

// ✅ Verify Payment
router.post(
  "/verify-payment",
  authMiddleware,
  verifyPayment
);

// ❌ Payment Failed
router.post(
  "/payment-failed",
  authMiddleware,
  markPaymentFailed
);

// 💰 Refund
router.post(
  "/refund",
  authMiddleware,
  adminMiddleware,
  refundPayment
);

module.exports = router;