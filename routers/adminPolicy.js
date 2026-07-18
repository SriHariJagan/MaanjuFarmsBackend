const express = require("express");
const router = express.Router();
const {
  getAllPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  publishPolicy,
  unpublishPolicy,
  archivePolicy,
  unarchivePolicy,
  deletePolicy,
  getPolicyVersions,
} = require("../controllers/policyController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// All admin policy routes require auth + admin
router.use(authMiddleware, adminMiddleware);

router.get("/", getAllPolicies);
router.get("/:id", getPolicyById);
router.post("/", createPolicy);
router.put("/:id", updatePolicy);
router.post("/:id/publish", publishPolicy);
router.post("/:id/unpublish", unpublishPolicy);
router.post("/:id/archive", archivePolicy);
router.post("/:id/unarchive", unarchivePolicy);
router.delete("/:id", deletePolicy);
router.get("/:id/versions", getPolicyVersions);

module.exports = router;
