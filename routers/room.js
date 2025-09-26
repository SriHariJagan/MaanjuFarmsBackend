const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const {
  addRoom,
  updateRoom,
  deleteRoom,
  getAllRooms,
  getRoomById
} = require("../controllers/roomController");

const router = express.Router();

// Admin routes
router.post("/", authMiddleware, adminMiddleware, addRoom);
router.put("/:id", authMiddleware, adminMiddleware, updateRoom);
router.delete("/:id", authMiddleware, adminMiddleware, deleteRoom);

// Public routes
router.get("/", getAllRooms);
router.get("/:id", getRoomById);

module.exports = router;
