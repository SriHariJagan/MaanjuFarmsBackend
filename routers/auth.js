const express = require("express");
const { signup, login, getMe, updateProfile } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");
const multer = require("../middleware/multerMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, multer("general").single("profileImage"), updateProfile);

module.exports = router;
