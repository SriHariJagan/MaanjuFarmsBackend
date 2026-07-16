const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "Maanju Farms" },
    siteLogo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    heroImages: [{ type: String }],
    homepageContent: { type: String, default: "" },
    aboutContent: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    address: { type: String, default: "" },
    socialLinks: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    seoKeywords: [{ type: String }],
    footerText: { type: String, default: "" },
    currency: { type: String, default: "INR" },
    taxRate: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    freeShippingAbove: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
