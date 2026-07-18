const express = require("express");
const router = express.Router();
const {
  getPublishedPolicies,
  getPublishedPolicy,
} = require("../controllers/policyController");

// Public: list all published policies
router.get("/", getPublishedPolicies);

// Public: get a single published policy by slug
router.get("/:slug", getPublishedPolicy);

module.exports = router;
