const express = require("express");
const router = express.Router();

const galleryCtrl = require("../controllers/galleryController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const multer = require("../middleware/multerMiddleware");

router.get("/", galleryCtrl.getGallery);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  multer("gallery").array("images", 10),
  galleryCtrl.addGalleryItem
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  multer("gallery").single("image"),
  galleryCtrl.updateGalleryItem
);

router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  galleryCtrl.updateGalleryItem
);

router.delete("/:id", authMiddleware, adminMiddleware, galleryCtrl.deleteGalleryItem);

module.exports = router;
