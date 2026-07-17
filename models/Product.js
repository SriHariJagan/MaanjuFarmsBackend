const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    image: { type: String }, // URL of the product image
    category: { type: String, required: true }, // ✅ New field for grouping
    unit: { type: String, enum: ["kg", "liter", "piece", ""], default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
