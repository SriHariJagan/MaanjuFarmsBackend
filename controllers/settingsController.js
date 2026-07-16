const Settings = require("../models/Settings");
const { deleteFile } = require("../utils/fileCleanup");

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const allowed = [
      "siteName", "siteLogo", "favicon", "heroImages", "homepageContent",
      "aboutContent", "contactEmail", "contactPhone", "address",
      "socialLinks", "seoTitle", "seoDescription", "seoKeywords",
      "footerText", "currency", "taxRate", "shippingCharge", "freeShippingAbove",
    ];

    const updateData = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    if (req.file) {
      if (updateData.siteLogo) deleteFile(updateData.siteLogo);
      updateData.siteLogo = `/uploads/${req.file.filename}`;
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(updateData);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, updateData, { new: true });
    }

    res.json({ success: true, data: settings });
  } catch (err) {
    if (req.file) deleteFile(`/uploads/${req.file.filename}`);
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to update settings" });
  }
};

exports.uploadHeroImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Image file is required" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ heroImages: [imageUrl] });
    } else {
      settings.heroImages.push(imageUrl);
      await settings.save();
    }
    res.json({ success: true, data: { imageUrl, heroImages: settings.heroImages } });
  } catch (err) {
    if (req.file) deleteFile(`/uploads/${req.file.filename}`);
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to upload hero image" });
  }
};

exports.deleteHeroImage = async (req, res) => {
  try {
    const { index } = req.params;
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ success: false, error: "Settings not found" });
    }
    const idx = Number(index);
    if (isNaN(idx) || idx < 0 || idx >= settings.heroImages.length) {
      return res.status(400).json({ success: false, error: "Invalid image index" });
    }
    const removed = settings.heroImages.splice(idx, 1)[0];
    if (removed) deleteFile(removed);
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to delete hero image" });
  }
};
