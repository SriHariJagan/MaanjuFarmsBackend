const express = require("express");
const router = express.Router();

const {getUserOrders,getAllOrders} = require("../controllers/orderController");
const {authMiddleware,adminMiddleware} = require("../middleware/authMiddleware");

router.get("/my-orders",authMiddleware,getUserOrders);

router.get("/all",authMiddleware,adminMiddleware,getAllOrders);

module.exports = router;