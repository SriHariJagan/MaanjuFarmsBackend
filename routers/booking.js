const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const { getUserBookings, getAllBookings, cancelBooking, updateBookingStatus } = require("../controllers/bookingController");

const router = express.Router();

// User views own bookings
router.get("/my-bookings", authMiddleware, getUserBookings);

// User cancels own booking
router.post("/:id/cancel", authMiddleware, cancelBooking);

// Admin views all bookings
router.get("/", authMiddleware, adminMiddleware, getAllBookings);

// Admin updates booking status
router.put("/:id/status", authMiddleware, adminMiddleware, updateBookingStatus);

module.exports = router;
