const express = require("express");
const router = express.Router();

const {
  createProductOrder,
  createBookingOrder,
  verifyPayment,
  markPaymentFailed,
} = require("../controllers/paymentController");

const { authMiddleware } = require("../middleware/authMiddleware");

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
  verifyPayment
);

// ❌ Payment Failed
router.post(
  "/payment-failed",
  authMiddleware,
  markPaymentFailed
);

module.exports = router;