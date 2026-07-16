const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const {
  getRevenueAnalytics,
  getOrderAnalytics,
  getBookingAnalytics,
  getProductAnalytics,
  getRoomAnalytics,
} = require("../controllers/adminAnalyticsController");

const router = express.Router();

router.get("/revenue", authMiddleware, adminMiddleware, getRevenueAnalytics);
router.get("/orders", authMiddleware, adminMiddleware, getOrderAnalytics);
router.get("/bookings", authMiddleware, adminMiddleware, getBookingAnalytics);
router.get("/products", authMiddleware, adminMiddleware, getProductAnalytics);
router.get("/rooms", authMiddleware, adminMiddleware, getRoomAnalytics);

module.exports = router;
