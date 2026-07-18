const mongoose = require("mongoose");

// ─── Valid Status Transitions ───────────────────────────────
const STATUS_FLOW = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "packed", "shipped", "out_for_delivery", "cancelled"],
  processing: ["packed", "shipped", "out_for_delivery", "cancelled"],
  packed: ["shipped", "out_for_delivery", "cancelled"],
  shipped: ["out_for_delivery", "delivered", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: ["returned"],
  cancelled: [],
  returned: ["refunded"],
  refunded: [],
};

const VALID_STATUSES = Object.keys(STATUS_FLOW);

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
        priceAtOrder: {
          type: Number,
        },
        nameAtOrder: {
          type: String,
        },
        imageAtOrder: {
          type: String,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    finalAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: VALID_STATUSES,
      default: "pending",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
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

    failureReason: {
      type: String,
      default: "",
    },

    cancelReason: {
      type: String,
      default: "",
    },

    // ─── Timeline ───────────────────────────────────────
    timeline: [
      {
        status: {
          type: String,
          enum: VALID_STATUSES,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        notes: {
          type: String,
          default: "",
        },
      },
    ],

    // ─── Delivery Details ───────────────────────────────
    delivery: {
      partner: { type: String, default: "" },
      trackingNumber: { type: String, default: "" },
      trackingUrl: { type: String, default: "" },
      estimatedDelivery: { type: Date },
      shippedDate: { type: Date },
      deliveredDate: { type: Date },
      notes: { type: String, default: "" },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    // ─── Delivery Address ───────────────────────────────
    deliveryAddress: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      street: { type: String, default: "" },
      apartment: { type: String, default: "" },
      city: { type: String, default: "" },
      district: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },

    emailSent: {
      type: Boolean,
      default: false,
    },

    webhookProcessed: {
      type: Boolean,
      default: false,
    },

    emailHistory: [
      {
        type: { type: String },
        sentAt: { type: Date, default: Date.now },
        status: { type: String, enum: ["sent", "failed"], default: "sent" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, status: 1 });
orderSchema.index({ "delivery.trackingNumber": 1 });
orderSchema.index({ createdAt: -1 });

// ─── Auto-Timeline on status change ─────────────────────────
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const lastEntry =
      this.timeline.length > 0
        ? this.timeline[this.timeline.length - 1]
        : null;
    if (!lastEntry || lastEntry.status !== this.status) {
      this.timeline.push({
        status: this.status,
        date: new Date(),
        notes: "",
      });
    }
  }
  next();
});

// ─── Virtual: formattedAddress ──────────────────────────────
orderSchema.virtual("formattedAddress").get(function () {
  const a = this.deliveryAddress || {};
  return `${a.street || ""}${a.apartment ? ", " + a.apartment : ""}, ${
    a.city || ""
  }, ${a.district || ""}, ${a.state || ""} - ${a.pincode || ""}`;
});

// ─── Static: valid transitions ──────────────────────────────
orderSchema.statics.isValidTransition = function (fromStatus, toStatus) {
  const allowed = STATUS_FLOW[fromStatus];
  return allowed ? allowed.includes(toStatus) : false;
};

orderSchema.statics.getValidStatuses = function () {
  return VALID_STATUSES;
};

orderSchema.statics.getStatusFlow = function () {
  return STATUS_FLOW;
};

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Order", orderSchema);
module.exports.STATUS_FLOW = STATUS_FLOW;
module.exports.VALID_STATUSES = VALID_STATUSES;
