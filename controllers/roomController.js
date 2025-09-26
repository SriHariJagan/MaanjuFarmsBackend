const Room = require("../models/Room");

// Add new room
exports.addRoom = async (req, res) => {
  try {
    const { name, type, price, status, image } = req.body;
    const room = new Room({ name, type, price, status, image });
    await room.save();
    res.status(201).json({ msg: "Room added", room });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Update room
exports.updateRoom = async (req, res) => {
  try {
    const updated = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ msg: "Room not found" });
    res.json({ msg: "Room updated", room: updated });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const deleted = await Room.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Room not found" });
    res.json({ msg: "Room deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get single room
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ msg: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
