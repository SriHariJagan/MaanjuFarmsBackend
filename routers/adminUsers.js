const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getUserById,
  updateUser,
} = require("../controllers/adminUserController");

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.get("/:id", authMiddleware, adminMiddleware, getUserById);
router.put("/:id", authMiddleware, adminMiddleware, updateUser);

module.exports = router;
