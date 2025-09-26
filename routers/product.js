const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById
} = require("../controllers/productController");

const router = express.Router();

// Admin routes
router.post("/", authMiddleware, adminMiddleware, addProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

module.exports = router;
