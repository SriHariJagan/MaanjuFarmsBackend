// models/Order.js

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },

        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    razorpayOrderId: {
      type: String,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
    },

    razorpaySignature: {
      type: String,
    },

    // ✅ TRACKING DETAILS

    trackingId: {
      type: String,
      default: "",
    },

    courierName: {
      type: String,
      default: "",
    },

    shippedAt: {
      type: Date,
    },

    deliveryAddress: {
      name: String,
      phone: String,
      email: String,
      street: String,
      apartment: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
    },

    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

orderSchema.virtual("formattedAddress").get(function () {
  const a = this.deliveryAddress || {};

  return `${a.street || ""}${
    a.apartment ? ", " + a.apartment : ""
  }, ${a.city || ""}, ${a.district || ""}, ${a.state || ""} - ${
    a.pincode || ""
  }`;
});

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Order", orderSchema);