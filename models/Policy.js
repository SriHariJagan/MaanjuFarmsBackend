const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const policySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    type: { type: String, default: "page" },
    content: { type: String, default: "" },
    sections: [sectionSchema],
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },
    version: { type: Number, default: 1 },
    effectiveFrom: { type: Date },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    publishedAt: { type: Date },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

policySchema.index({ status: 1, slug: 1 });
policySchema.index({ status: 1, updatedAt: -1 });

module.exports = mongoose.model("Policy", policySchema);
