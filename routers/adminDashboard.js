const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const {
  getOverview,
  getRecent,
  getStatus,
  getInventory,
} = require("../controllers/adminDashboardController");

const router = express.Router();

router.get("/overview", authMiddleware, adminMiddleware, getOverview);
router.get("/recent", authMiddleware, adminMiddleware, getRecent);
router.get("/status", authMiddleware, adminMiddleware, getStatus);
router.get("/inventory", authMiddleware, adminMiddleware, getInventory);

module.exports = router;
