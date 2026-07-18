const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const sendMailByType = require("../mails/mailTypes");

// ✅ USER BOOKINGS
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("room")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ ADMIN BOOKINGS
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("room")
      .populate("user")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ CANCEL BOOKING
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ msg: "Unauthorized" });

    booking.status = "cancelled";
    booking.paymentStatus = "failed";

    // Unblock the room
    await Room.findByIdAndUpdate(booking.room, {
      isBlocked: false,
      blockedUntil: null,
    });

    await booking.save();
    res.json({ msg: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ ADMIN UPDATE BOOKING STATUS
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate("user")
      .populate("room");

    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    const validStatuses = ["pending", "confirmed", "cancelled", "payment_failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: `Invalid status: ${status}` });
    }

    booking.status = status;

    if (status === "cancelled") {
      booking.paymentStatus = "failed";
      await Room.findByIdAndUpdate(booking.room, {
        isBlocked: false,
        blockedUntil: null,
      });
    }

    if (status === "confirmed" && booking.paymentStatus === "pending") {
      booking.paymentStatus = "paid";
    }

    await booking.save();

    // Send email notification
    if (status === "confirmed") {
      sendMailByType("VILLA_BOOKING", {
        user: booking.user,
        bookingId: booking._id,
        room: booking.room,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalAmount: booking.totalAmount,
        guestDetails: booking.guestDetails,
      }).catch((e) => console.error("Booking status email failed:", e.message));
    }

    res.json({ success: true, msg: `Booking status updated to "${status}"`, booking });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};