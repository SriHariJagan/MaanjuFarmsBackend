const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

const multer = require("../middleware/multerMiddleware"); // ✅ reusable multer

const {
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} = require("../controllers/productController");

const router = express.Router();

/* ================= ADMIN ROUTES ================= */

// ✅ Add Product (with image upload)
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  multer("products").single("image"), // 🔥 HERE
  addProduct
);

// ✅ Update Product (with image upload)
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  multer("products").single("image"), // 🔥 HERE
  updateProduct
);

// ✅ Delete Product
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

/* ================= PUBLIC ROUTES ================= */

router.get("/", getAllProducts);
router.get("/:id", getProductById);

module.exports = router;