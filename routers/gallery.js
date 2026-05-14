const express = require("express");
const router = express.Router();

const galleryCtrl = require("../controllers/galleryController");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

const multer = require("../middleware/multerMiddleware");

// Get all
router.get("/", galleryCtrl.getGallery);

// Add gallery image
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  multer("gallery").single("image"),
  galleryCtrl.addGalleryItem
);

// Update gallery image
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  multer("gallery").single("image"),
  galleryCtrl.updateGalleryItem
);

// Delete
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  galleryCtrl.deleteGalleryItem
);

module.exports = router;