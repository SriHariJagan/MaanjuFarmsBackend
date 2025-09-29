const Gallery = require("../models/Gallery");

// Get all gallery items
exports.getGallery = async (req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
};

// Add a new gallery item (Admin only)
exports.addGalleryItem = async (req, res) => {
  try {
    const { title, imageUrl } = req.body;
    const uploadedImage = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || (!imageUrl && !uploadedImage)) {
      return res.status(400).json({ error: "Title and image or URL required" });
    }

    const newItem = new Gallery({
      title,
      imageUrl: uploadedImage || imageUrl,
      createdBy: req.user.id,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add gallery item" });
  }
};

// Update gallery item (Admin only)
exports.updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, imageUrl } = req.body;
    const uploadedImage = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title && !imageUrl && !uploadedImage) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const updatedItem = await Gallery.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(uploadedImage && { imageUrl: uploadedImage }),
        ...(imageUrl && { imageUrl }),
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Gallery item not found" });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update gallery item" });
  }
};

// Delete gallery item (Admin only)
exports.deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    await Gallery.findByIdAndDelete(id);
    res.json({ message: "Gallery item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete gallery item" });
  }
};
