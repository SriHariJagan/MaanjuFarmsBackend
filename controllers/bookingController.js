const Booking = require("../models/Booking");
const Room = require("../models/Room");

// Book a room
exports.bookRoom = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    const room = await Room.findById(roomId);
    if (!room || room.status !== "available")
      return res.status(400).json({ msg: "Room not available" });

    const booking = new Booking({
      user: req.user.id,
      room: roomId,
      checkIn,
      checkOut,
      status: "confirmed",
    });
    await booking.save();

    // Mark room as booked
    room.status = "booked";
    await room.save();

    res.json({ msg: "Room booked", booking });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// User: Get own bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate("room");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Admin: Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user").populate("room");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
