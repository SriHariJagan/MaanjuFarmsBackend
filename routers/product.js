const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const multer = require("../middleware/multerMiddleware");

const {
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getCategories,
} = require("../controllers/productController");

const router = express.Router();

router.get("/categories", getCategories);

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post("/", authMiddleware, adminMiddleware, multer("products").single("image"), addProduct);
router.put("/:id", authMiddleware, adminMiddleware, multer("products").single("image"), updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;
