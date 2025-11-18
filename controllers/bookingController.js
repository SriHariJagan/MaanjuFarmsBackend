const Booking = require("../models/Booking");
const Room = require("../models/Room");

// Book a room
exports.bookRoom = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    // Validate inputs
    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ msg: "Missing booking details" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ msg: "Room not found" });

    // Convert dates to Date objects
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check for overlapping bookings for the same room
    const overlappingBooking = await Booking.findOne({
      room: roomId,
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    });

    if (overlappingBooking) {
      return res
        .status(400)
        .json({ msg: "Room already booked for selected dates" });
    }

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      status: "confirmed",
    });
    await booking.save();

    res.json({ msg: "Room booked successfully", booking });
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
