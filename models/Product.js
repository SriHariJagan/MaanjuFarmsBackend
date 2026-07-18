const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    image: { type: String },
    category: { type: String, required: true },
    unit: { type: String, default: "kg" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
