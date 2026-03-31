const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

// ✅ CREATE BOOKING - safe for concurrency
exports.bookRoom = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { roomId, checkIn, checkOut } = req.body;
    console.log(roomId, checkIn, checkOut)
    if (!roomId || !checkIn || !checkOut)
      return res.status(400).json({ msg: "Missing booking details" });

    const room = await Room.findById(roomId).session(session);
    if (!room) return res.status(404).json({ msg: "Room not found" });
    if (room.status === "maintenance") return res.status(400).json({ msg: "Room under maintenance" });

    const checkInDate = new Date(`${checkIn}T00:00:00`);
    const checkOutDate = new Date(`${checkOut}T23:59:59`);

    if (checkOutDate <= checkInDate) return res.status(400).json({ msg: "Invalid date range" });

    // Prevent overlapping bookings per room
    const overlapping = await Booking.findOne({
      room: roomId,
      status: { $in: ["pending", "confirmed"] },
      expiresAt: { $gt: new Date() }, // 🔥 important
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    }).session(session);

    if (overlapping) return res.status(400).json({ msg: "Room already booked for selected dates" });

    const booking = await Booking.create(
      [
        {
          user: req.user.id,
          room: roomId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          status: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ msg: "Booking created", booking: booking[0] });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  } finally {
    session.endSession();
  }
};

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
    await booking.save();
    res.json({ msg: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};