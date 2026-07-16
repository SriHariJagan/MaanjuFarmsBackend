const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: String,
    price: { type: Number, required: true, index: true },
    stock: { type: Number, required: true },
    image: { type: String },
    category: { type: String, required: true, index: true },
    status: { type: String, enum: ["published", "draft"], default: "published", index: true },
  },
  { timestamps: true }
);

productSchema.index({ createdAt: -1 });
productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
