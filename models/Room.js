const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // villa/room name
    category: { 
      type: String, 
      enum: ["room", "villa"], 
      default: "room" 
    }, // differentiate rooms and villas
    type: { 
      type: String, 
      enum: ["single", "double", "suite", "cottage", "villa"], 
      default: "single" 
    },
    price: { type: Number, default: 0 }, // optional for villas
    status: { 
      type: String, 
      enum: ["available", "booked", "maintenance"], 
      default: "available" 
    },
    description: { type: String },
    image: { type: String }, // URL of the room/villa image
    bookings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        checkIn: { type: Date, required: true },
        checkOut: { type: Date, required: true },
        guests: { type: Number, default: 1 },
        createdAt: { type: Date, default: Date.now },
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
