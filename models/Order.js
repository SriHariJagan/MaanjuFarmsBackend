// models/Order.js

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
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
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
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

    // =====================================
    // SHIPPING DETAILS
    // =====================================

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

    // =====================================
    // DELIVERY ADDRESS
    // =====================================

    deliveryAddress: {
      name: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        default: "",
      },

      street: {
        type: String,
        default: "",
      },

      apartment: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      district: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      pincode: {
        type: String,
        default: "",
      },
    },

    emailSent: {
      type: Boolean,
      default: false,
    },

    webhookProcessed: {
      type: Boolean,
      default: false,
    },

    timeline: [
      {
        status: { type: String, required: true },
        note: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// =====================================
// INDEXES
// =====================================

orderSchema.index({
  user: 1,
  createdAt: -1,
});

orderSchema.index({
  paymentStatus: 1,
  status: 1,
});

// =====================================
// VIRTUAL ADDRESS
// =====================================

orderSchema.virtual(
  "formattedAddress"
).get(function () {
  const a = this.deliveryAddress || {};

  return `${a.street || ""}${a.apartment
      ? ", " + a.apartment
      : ""
    }, ${a.city || ""}, ${a.district || ""
    }, ${a.state || ""} - ${a.pincode || ""
    }`;
});

orderSchema.set("toJSON", {
  virtuals: true,
});

orderSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model(
  "Order",
  orderSchema
);