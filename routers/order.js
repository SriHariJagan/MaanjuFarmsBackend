const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const { createOrder, getUserOrders, getAllOrders } = require("../controllers/orderController");

const router = express.Router();

// User creates order
router.post("/", authMiddleware, createOrder);

// User views own orders
router.get("/my-orders", authMiddleware, getUserOrders);

// Admin views all orders
router.get("/", authMiddleware, adminMiddleware, getAllOrders);

module.exports = router;
