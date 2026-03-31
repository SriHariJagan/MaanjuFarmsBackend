const express = require("express");
const {
  addRoom,
  updateRoom,
  deleteRoom,
  getAllRooms,
  getRoomById,
  checkRoomAvailability
} = require("../controllers/roomController");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin
router.post("/", authMiddleware, adminMiddleware, addRoom);
router.put("/:id", authMiddleware, adminMiddleware, updateRoom);
router.delete("/:id", authMiddleware, adminMiddleware, deleteRoom);

// Public
router.get("/", getAllRooms);
router.get("/:id", getRoomById);

// 🔥 NEW: availability API
router.get("/:id/availability", checkRoomAvailability);

module.exports = router;