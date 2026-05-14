// routes/orderRoutes.js

const express = require("express");

const router = express.Router();

const {
  getUserOrders,
  getAllOrders,
  updateOrder,
} = require("../controllers/orderController");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

router.get(
  "/my-orders",
  authMiddleware,
  getUserOrders
);

router.get(
  "/all",
  authMiddleware,
  adminMiddleware,
  getAllOrders
);

//
// ✅ ADMIN UPDATE ORDER
//

router.put(
  "/update/:id",
  authMiddleware,
  adminMiddleware,
  updateOrder
);

module.exports = router;