const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    category: { type: String, enum: ["room", "villa"], default: "room", index: true },
    type: { type: String, enum: ["single", "double", "suite", "villa", "cottage"], default: "single" },
    price: { type: Number, required: true, index: true },
    status: { type: String, enum: ["available", "booked", "maintenance"], default: "available", index: true },
    description: String,
    image: String,
    amenities: [{ type: String }],
    isBlocked: { type: Boolean, default: false, index: true },
    blockedUntil: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

roomSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Room", roomSchema);
