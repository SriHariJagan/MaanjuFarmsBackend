const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const { bookRoom, getUserBookings, getAllBookings } = require("../controllers/bookingController");

const router = express.Router();

// User books room
router.post("/", authMiddleware, bookRoom);

// User views own bookings
router.get("/my-bookings", authMiddleware, getUserBookings);

// Admin views all bookings
router.get("/", authMiddleware, adminMiddleware, getAllBookings);

module.exports = router;
