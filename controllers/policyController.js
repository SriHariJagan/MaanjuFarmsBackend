const Policy = require("../models/Policy");

const PUBLIC_FIELDS = "title slug sections content status version effectiveFrom publishedAt updatedAt metaDescription";

// ─── HELPERS ────────────────────────────────────────────────────

const publishedFilter = (slug) => ({
  slug,
  status: "PUBLISHED",
});

const notFound = (res, msg = "Policy not found") =>
  res.status(404).json({ success: false, msg });

// =================================================================
// 🏛️ PUBLIC APIS
// =================================================================

// GET /api/policies — list published policies
exports.getPublishedPolicies = async (req, res) => {
  try {
    const policies = await Policy.find(
      { status: "PUBLISHED" },
      PUBLIC_FIELDS
    ).sort({ updatedAt: -1 });

    return res.json({ success: true, data: policies });
  } catch (err) {
    console.error("GET PUBLISHED POLICIES ERROR:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

// GET /api/policies/:slug — single published policy
exports.getPublishedPolicy = async (req, res) => {
  try {
    const policy = await Policy.findOne(
      publishedFilter(req.params.slug),
      PUBLIC_FIELDS
    );

    if (!policy) return notFound(res);

    return res.json({ success: true, data: policy });
  } catch (err) {
    console.error("GET PUBLISHED POLICY ERROR:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

// =================================================================
// 🔐 ADMIN APIS
// =================================================================

// GET /api/admin/policies — list all policies (all statuses)
exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find()
      .populate("lastUpdatedBy", "name email")
      .populate("publishedBy", "name email")
      .sort({ updatedAt: -1 });

    return res.json({ success: true, data: policies });
  } catch (err) {
    console.error("GET ALL POLICIES ERROR:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

// GET /api/admin/policies/:id — single policy by _id
exports.getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate("lastUpdatedBy", "name email")
      .populate("publishedBy", "name email");

    if (!policy) return notFound(res);

    return res.json({ success: true, data: policy });
  } catch (err) {
    console.error("GET POLICY BY ID ERROR:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

// POST /api/admin/policies — create new policy (draft)
exports.createPolicy = async (req, res) => {
  try {
    const { title, slug, content, sections, metaDescription } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ success: false, msg: "Title and slug are required" });
    }

    const existing = await Policy.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, msg: "Policy with this slug already exists" });
    }

    const policy = await Policy.create({
      title,
      slug,
      content: content || "",
      sections: sections || [],
      metaDescription: metaDescription || "",
      status: "DRAFT",
      version: 1,
      lastUpdatedBy: req.user.id,
    });

    return res.status(201).json({ success: true, data: policy });
  } catch (err) {
    console.error("CREATE POLICY ERROR:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

// PUT /api/admin/policies/:id — update draft (creates new version if published)
exports.updatePolicy = async (req, res) => {
  try {
    const { title, slug, content, sections, metaDescription } = req.body;
    const policy = await Policy.findById(req.params.id);

    if (!policy) return notFound(res);

    // If published, create a new draft version instead of overwriting
    if (policy.status === "PUBLISHED") {
      const newPolicy = await Policy.create({
        title: title || policy.title,
        slug: policy.slug,
        content: content !== undefined ? content : policy.content,
        sections: sections || policy.sections,
        metaDescription: metaDescription !== undefined ? metaDescription : policy.metaDescription,
        status: "DRAFT",
        version: policy.version + 1,
        lastUpdatedBy: req.user.id,
      });

      return res.json({ success: true, data: newPolicy, msg: "New draft version created from published policy" });
    }

    // For drafts/archived, update in place
    if (title) policy.title = title;
    if (slug) policy.slug = slug;
    if (content !== undefined) policy.content = content;
    if (sections) policy.sections = sections;
    if (metaDescription !== undefined) policy.metaDescription = metaDescription;
    policy.lastUpdatedBy = req.user.id;

    await policy.save();

    return res.json({ success: true, data: policy, msg: "Policy draft updated" });
  } catch (err) {
    console.error("UPDATE POLICY ERROR:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

// POST /api/admin/policies/:id/publish — publish a draft
exports.publishPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return notFound(res);

    if (policy.status === "PUBLISHED") {
      return res.status(400).json({ success: false, msg: "Policy is already published" });
    }

    policy.status = "PUBLISHED";
    policy.publishedBy = req.user.id;
    policy.publishedAt = new Date();
    policy.effectiveFrom = new Date();
    policy.lastUpdatedBy = req.user.id;
    await policy.save();

    return res.json({ success: true, data: policy, msg: "Policy published" });
  } catch (err) {
    console.error("PUBLISH POLICY ERROR:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

// POST /api/admin/policies/:id/unpublish — revert to draft
exports.unpublishPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return notFound(res);

    policy.status = "DRAFT";
    policy.lastUpdatedBy = req.user.id;
    await policy.save();

    return res.json({ success: true, data: policy, msg: "Policy unpublished (reverted to draft)" });
  } catch (err) {
    console.error("UNPUBLISH POLICY ERROR:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

// POST /api/admin/policies/:id/unarchive — restore from archive to draft
exports.unarchivePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return notFound(res);

    if (policy.status !== "ARCHIVED") {
      return res.status(400).json({ success: false, msg: "Only archived policies can be unarchived" });
    }

    policy.status = "DRAFT";
    policy.lastUpdatedBy = req.user.id;
    await policy.save();

    return res.json({ success: true, data: policy, msg: "Policy restored from archive to draft" });
  } catch (err) {
    console.error("UNARCHIVE POLICY ERROR:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

// POST /api/admin/policies/:id/archive — archive
exports.archivePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return notFound(res);

    policy.status = "ARCHIVED";
    policy.lastUpdatedBy = req.user.id;
    await policy.save();

    return res.json({ success: true, data: policy, msg: "Policy archived" });
  } catch (err) {
    console.error("ARCHIVE POLICY ERROR:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

// DELETE /api/admin/policies/:id — permanently delete
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) return notFound(res);

    return res.json({ success: true, msg: "Policy permanently deleted" });
  } catch (err) {
    console.error("DELETE POLICY ERROR:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

// GET /api/admin/policies/:id/versions — list all versions by slug
exports.getPolicyVersions = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id).select("slug");
    if (!policy) return notFound(res);

    const versions = await Policy.find(
      { slug: policy.slug },
      "title slug status version publishedAt createdAt updatedAt"
    )
      .populate("lastUpdatedBy", "name email")
      .sort({ version: -1 });

    return res.json({ success: true, data: versions });
  } catch (err) {
    console.error("GET POLICY VERSIONS ERROR:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};
