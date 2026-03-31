const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, enum: ["room", "villa"], default: "room" },
    type: { type: String, enum: ["single", "double", "suite", "villa", "cottage"], default: "single" },
    price: { type: Number, required: true },
    status: { type: String, enum: ["available", "maintenance"], default: "available" },
    description: String,
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);