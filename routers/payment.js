const express = require("express");
const router = express.Router();

const {
  createProductCheckout,
  createBookingCheckout,
  verifySession,
} = require("../controllers/paymentController");

const { authMiddleware } = require("../middleware/authMiddleware");

// 🛒 Product
router.post("/product-checkout", authMiddleware, createProductCheckout);

// 🏨 Booking
router.post("/booking-checkout", authMiddleware, createBookingCheckout);

// Verify
router.get("/verify-session", verifySession);



module.exports = router;