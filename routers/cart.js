const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { addToCart, getCart, removeFromCart } = require("../controllers/cartController");

const router = express.Router();

// User routes only
router.post("/add", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.post("/remove", authMiddleware, removeFromCart);

module.exports = router;
