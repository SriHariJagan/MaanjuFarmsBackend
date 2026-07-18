const express = require("express");
const { signup, login, getMe, forgotPassword, resetPassword } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware"); // destructure

const router = express.Router();

// 🔹 Routes
router.post("/signup", signup);
router.post("/login", login);

// Protected route
router.get("/me", authMiddleware, getMe);

// Password reset routes (public)
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
