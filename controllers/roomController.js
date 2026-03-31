const Room = require("../models/Room");
const Booking = require("../models/Booking");

//
// ✅ ADD ROOM (VALIDATED)
//
exports.addRoom = async (req, res) => {
  try {
    const { name, category, type, price, status, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Room name is required" });
    }

    const room = new Room({
      name,
      category,
      type,
      price,
      status,
      description,
      image,
    });

    await room.save();

    res.status(201).json({ msg: "Room added", room });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

//
// ✅ UPDATE ROOM (SAFE)
//
exports.updateRoom = async (req, res) => {
  try {
    const updated = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Room not found" });
    }

    res.json({ msg: "Room updated", room: updated });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

//
// ✅ DELETE ROOM (WITH BOOKING CHECK)
//
exports.deleteRoom = async (req, res) => {
  try {
    // 🚨 prevent deleting booked room
    const activeBooking = await Booking.findOne({
      room: req.params.id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (activeBooking) {
      return res.status(400).json({
        msg: "Cannot delete room with active bookings",
      });
    }

    const deleted = await Room.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ msg: "Room not found" });
    }

    res.json({ msg: "Room deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

//
// ✅ GET ALL ROOMS (FILTER + SEARCH + PAGINATION)
//
exports.getAllRooms = async (req, res) => {
  try {
    const {
      category,
      type,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    let filter = {};

    if (category) filter.category = category;
    if (type) filter.type = type;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const rooms = await Room.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Room.countDocuments(filter);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      rooms,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

//
// ✅ GET ROOM BY ID
//
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

//
// 🔥 CHECK ROOM AVAILABILITY (IMPORTANT)
//
exports.checkRoomAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ msg: "Dates required" });
    }

    const checkInDate = new Date(`${checkIn}T00:00:00`);
    const checkOutDate = new Date(`${checkOut}T23:59:59`);

    const overlapping = await Booking.findOne({
      room: req.params.id,
      status: { $in: ["pending", "confirmed"] },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    res.json({
      available: !overlapping,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};