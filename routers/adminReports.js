const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const {
  getSalesReport,
  getBookingsReport,
  getProductsReport,
  getInventoryReport,
} = require("../controllers/adminReportsController");

const router = express.Router();

router.get("/sales", authMiddleware, adminMiddleware, getSalesReport);
router.get("/bookings", authMiddleware, adminMiddleware, getBookingsReport);
router.get("/products", authMiddleware, adminMiddleware, getProductsReport);
router.get("/inventory", authMiddleware, adminMiddleware, getInventoryReport);

module.exports = router;
