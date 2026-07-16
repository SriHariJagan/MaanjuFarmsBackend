const express = require("express");
const {
  addRoom,
  updateRoom,
  deleteRoom,
  getAllRooms,
  getRoomById,
  checkRoomAvailability,
  updateRoomStatus,
  getRoomBookings,
} = require("../controllers/roomController");

const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const multer = require("../middleware/multerMiddleware");

const router = express.Router();

router.get("/", getAllRooms);
router.get("/:id", getRoomById);
router.get("/:id/availability", checkRoomAvailability);

router.post("/", authMiddleware, adminMiddleware, multer("rooms").single("image"), addRoom);
router.put("/:id", authMiddleware, adminMiddleware, multer("rooms").single("image"), updateRoom);
router.delete("/:id", authMiddleware, adminMiddleware, deleteRoom);
router.patch("/:id/status", authMiddleware, adminMiddleware, updateRoomStatus);
router.get("/:id/bookings", authMiddleware, adminMiddleware, getRoomBookings);

module.exports = router;
