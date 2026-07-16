const Room = require("../models/Room");
const Booking = require("../models/Booking");
const { deleteFile } = require("../utils/fileCleanup");

exports.addRoom = async (req, res) => {
  try {
    const { name, category, type, price, status, description } = req.body;

    const errors = {};
    if (!name || !name.trim()) errors.name = "Room name is required";
    if (price === undefined || price === "" || isNaN(Number(price)) || Number(price) < 0)
      errors.price = "Price must be a positive number";
    if (status && !["available", "booked", "maintenance"].includes(status))
      errors.status = "Status must be available, booked, or maintenance";

    if (Object.keys(errors).length > 0) {
      if (req.file) deleteFile(`/uploads/rooms/${req.file.filename}`);
      return res.status(400).json({ success: false, error: "Validation failed", fields: errors });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/rooms/${req.file.filename}`;
    }

    const room = await Room.create({
      name: name.trim(),
      category: category || "villa",
      type: type || "villa",
      price: Number(price),
      status: status || "available",
      description: description || "",
      image: imagePath,
    });

    res.status(201).json({ success: true, data: room });
  } catch (err) {
    if (req.file) deleteFile(`/uploads/rooms/${req.file.filename}`);
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { name, category, type, price, status, description } = req.body;
    const existing = await Room.findById(req.params.id);
    if (!existing) {
      if (req.file) deleteFile(`/uploads/rooms/${req.file.filename}`);
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    const errors = {};
    if (name !== undefined && !name.trim()) errors.name = "Room name cannot be empty";
    if (price !== undefined && price !== "" && (isNaN(Number(price)) || Number(price) < 0))
      errors.price = "Price must be a positive number";
    if (status !== undefined && !["available", "booked", "maintenance"].includes(status))
      errors.status = "Status must be available, booked, or maintenance";

    if (Object.keys(errors).length > 0) {
      if (req.file) deleteFile(`/uploads/rooms/${req.file.filename}`);
      return res.status(400).json({ success: false, error: "Validation failed", fields: errors });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category;
    if (type !== undefined) updateData.type = type;
    if (price !== undefined) updateData.price = Number(price);
    if (status !== undefined) updateData.status = status;
    if (description !== undefined) updateData.description = description;

    if (req.file) {
      if (existing.image) deleteFile(existing.image);
      updateData.image = `/uploads/rooms/${req.file.filename}`;
    }

    const updated = await Room.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.json({ success: true, data: updated });
  } catch (err) {
    if (req.file) deleteFile(`/uploads/rooms/${req.file.filename}`);
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, error: "Room not found" });

    const activeBooking = await Booking.findOne({
      room: req.params.id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete room with active bookings",
      });
    }

    if (room.image) deleteFile(room.image);
    await Room.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: { message: "Room deleted" } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const { category, type, minPrice, maxPrice, search, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.name = { $regex: search, $options: "i" };

    const total = await Room.countDocuments(filter);
    const rooms = await Room.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        rooms,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, error: "Room not found" });
    res.json({ success: true, data: room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.updateRoomStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["available", "booked", "maintenance"].includes(status)) {
      return res.status(400).json({ success: false, error: "Status must be available, booked, or maintenance" });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!room) return res.status(404).json({ success: false, error: "Room not found" });

    res.json({ success: true, data: room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.checkRoomAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, error: "Check-in and check-out dates are required" });
    }

    const checkInDate = new Date(`${checkIn}T00:00:00`);
    const checkOutDate = new Date(`${checkOut}T23:59:59`);

    const overlapping = await Booking.findOne({
      room: req.params.id,
      status: { $in: ["pending", "confirmed"] },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    res.json({ success: true, data: { available: !overlapping } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.getRoomBookings = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, error: "Room not found" });

    const bookings = await Booking.find({ room: req.params.id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
