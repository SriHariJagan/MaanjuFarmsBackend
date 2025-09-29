const express = require("express");
const router = express.Router();
const galleryCtrl = require("../controllers/galleryController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const multer = require("multer");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Get all (public)
router.get("/", galleryCtrl.getGallery);

// Add new (Admin only) → file OR URL
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), galleryCtrl.addGalleryItem);

// Update (Admin only) → file OR URL
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), galleryCtrl.updateGalleryItem);

// Delete (Admin only)
router.delete("/:id", authMiddleware, adminMiddleware, galleryCtrl.deleteGalleryItem);

module.exports = router;
