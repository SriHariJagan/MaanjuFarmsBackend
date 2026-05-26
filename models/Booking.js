// models/Booking.js

const mongoose = require("mongoose");

const bookingSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      room: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
      },

      checkIn: {
        type: Date,
        required: true,
      },

      checkOut: {
        type: Date,
        required: true,
      },

      guests: {
        type: Number,
        default: 1,
        min: 1,
      },

      guestDetails: [
        {
          name: {
            type: String,
            default: "",
          },

          age: {
            type: Number,
          },

          gender: {
            type: String,
            default: "",
          },
        },
      ],

      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "confirmed",
          "payment_failed",
          "cancelled",
        ],
        default: "pending",
        index: true,
      },

      paymentStatus: {
        type: String,
        enum: [
          "pending",
          "paid",
          "failed",
        ],
        default: "pending",
        index: true,
      },

      razorpayOrderId: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
      },

      razorpayPaymentId: {
        type: String,
        unique: true,
        sparse: true,
      },

      razorpaySignature: {
        type: String,
        default: "",
      },

      paidAt: {
        type: Date,
      },

      webhookProcessed: {
        type: Boolean,
        default: false,
      },

      expiresAt: {
        type: Date,
        default: () =>
          new Date(
            Date.now() +
            15 * 60 * 1000
          ),
      },
    },
    {
      timestamps: true,
    }
  );

// =====================================
// TTL INDEX
// =====================================

bookingSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// =====================================
// PERFORMANCE INDEXES
// =====================================

bookingSchema.index({
  user: 1,
  createdAt: -1,
});

bookingSchema.index({
  paymentStatus: 1,
  status: 1,
});

module.exports = mongoose.model(
  "Booking",
  bookingSchema
);