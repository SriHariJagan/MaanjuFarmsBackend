const express = require("express");
const { signup, login, getMe } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware"); // destructure

const router = express.Router();

// 🔹 Routes
router.post("/signup", signup);
router.post("/login", login);

// Protected route
router.get("/me", authMiddleware, getMe);

module.exports = router;
