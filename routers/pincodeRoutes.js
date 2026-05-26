const express = require("express");

const router = express.Router();

const {
  checkPincode,
  addBlockedPincode,
  getBlockedPincodes,
  deleteBlockedPincode,
} = require("../controllers/pincodeController");

const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

/* =========================================
   PUBLIC ROUTE
========================================= */

// User checkout validation

router.get(
  "/check/:pin",
  checkPincode
);

/* =========================================
   ADMIN ROUTES
========================================= */

// Get blocked pincodes

router.get(
  "/blocked",
  authMiddleware,
  adminMiddleware,
  getBlockedPincodes
);

// Add blocked pincode

router.post(
  "/blocked",
  authMiddleware,
  adminMiddleware,
  addBlockedPincode
);

// Delete blocked pincode

router.delete(
  "/blocked/:id",
  authMiddleware,
  adminMiddleware,
  deleteBlockedPincode
);

module.exports = router;