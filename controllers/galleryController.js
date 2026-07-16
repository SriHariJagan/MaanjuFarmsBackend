const Gallery = require("../models/Gallery");
const { deleteFile } = require("../utils/fileCleanup");

exports.getGallery = async (req, res) => {
  try {
    const { page, limit, all } = req.query;

    if (all === "true") {
      const items = await Gallery.find().sort({ order: 1, createdAt: -1 });
      return res.json({ success: true, data: items });
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

    const [total, items] = await Promise.all([
      Gallery.countDocuments(),
      Gallery.find()
        .sort({ order: 1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch gallery" });
  }
};

exports.addGalleryItem = async (req, res) => {
  try {
    const { title, caption, order } = req.body;

    const files = req.files && req.files.length > 0 ? req.files : req.file ? [req.file] : [];

    if (!title || !title.trim()) {
      files.forEach((f) => deleteFile(`/uploads/gallery/${f.filename}`));
      return res.status(400).json({ success: false, error: "Title is required" });
    }

    if (files.length === 0) {
      return res.status(400).json({ success: false, error: "At least one image is required" });
    }

    const items = files.map((file) => ({
      title: title.trim(),
      caption: caption || "",
      imageUrl: `/uploads/gallery/${file.filename}`,
      order: order !== undefined ? Number(order) : 0,
      createdBy: req.user.id,
    }));

    const created = await Gallery.insertMany(items);

    res.status(201).json({ success: true, data: created.length === 1 ? created[0] : created });
  } catch (err) {
    const files = req.files && req.files.length > 0 ? req.files : req.file ? [req.file] : [];
    files.forEach((f) => deleteFile(`/uploads/gallery/${f.filename}`));
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to add gallery item(s)" });
  }
};

exports.updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, caption, order } = req.body;

    const existing = await Gallery.findById(id);
    if (!existing) {
      if (req.file) deleteFile(`/uploads/gallery/${req.file.filename}`);
      return res.status(404).json({ success: false, error: "Gallery item not found" });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (caption !== undefined) updateData.caption = caption;
    if (order !== undefined) updateData.order = Number(order);

    if (req.file) {
      if (existing.imageUrl) deleteFile(existing.imageUrl);
      updateData.imageUrl = `/uploads/gallery/${req.file.filename}`;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: "Nothing to update" });
    }

    const updated = await Gallery.findByIdAndUpdate(id, updateData, { new: true });

    res.json({ success: true, data: updated });
  } catch (err) {
    if (req.file) deleteFile(`/uploads/gallery/${req.file.filename}`);
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to update gallery item" });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Gallery.findById(id);
    if (!item) return res.status(404).json({ success: false, error: "Gallery item not found" });

    if (item.imageUrl) deleteFile(item.imageUrl);
    await Gallery.findByIdAndDelete(id);

    res.json({ success: true, data: { message: "Gallery item deleted" } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to delete gallery item" });
  }
};
